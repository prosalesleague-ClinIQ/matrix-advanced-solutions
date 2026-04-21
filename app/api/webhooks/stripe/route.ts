/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler. Fires on payment_intent.succeeded when a card
 * payment clears and performs the exact same post-payment updates as
 * /api/admin/wire-confirm does for wire payments:
 *
 *   • order.payment_status → 'paid'
 *   • all invoices for the order → 'paid' + paid_at + locked=true
 *   • payments row inserted
 *   • clinic.completed_order_count incremented
 *   • First order: tier → 'returning', card_enabled = true (tier upgrade audit)
 *   • GHL sync (tag + total_orders / total_spend custom field update)
 *   • Audit log entry for the payment
 *
 * Previously this handler only did the first three steps, creating an
 * asymmetry where wire-paying clinics got tier upgrades and CRM sync
 * but card-paying clinics did not.
 */

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { syncWireConfirmed } from '@/lib/ghl/sync'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[STRIPE_WEBHOOK] Signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // ── payment_intent.processing: ACH submitted, waiting 1-3 days to clear ──
  // Move the order to awaiting_wire so the admin dashboard reflects "pending".
  if (event.type === 'payment_intent.processing') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { data: procOrder } = await admin
      .from('orders')
      .select('id, order_number, payment_status')
      .eq('stripe_payment_intent_id', pi.id)
      .single()

    if (procOrder && procOrder.payment_status !== 'paid') {
      await admin
        .from('orders')
        .update({
          payment_status: 'awaiting_wire',
          updated_at: new Date().toISOString(),
        })
        .eq('id', procOrder.id)
      console.log(
        `[STRIPE_WEBHOOK] ACH processing for order ${procOrder.order_number}`
      )
    }
    return NextResponse.json({ received: true })
  }

  // ── payment_intent.payment_failed: surface a failure signal ──
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent
    const { data: failOrder } = await admin
      .from('orders')
      .select('id, order_number, payment_status')
      .eq('stripe_payment_intent_id', pi.id)
      .single()

    if (failOrder && failOrder.payment_status !== 'paid') {
      await admin
        .from('orders')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', failOrder.id)
      console.warn(
        `[STRIPE_WEBHOOK] Payment failed for order ${failOrder.order_number}`
      )
    }
    return NextResponse.json({ received: true })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent

  // ── Find order ─────────────────────────────────────────────
  const { data: order } = await admin
    .from('orders')
    .select('id, clinic_id, order_number, total, payment_status')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (!order) {
    console.warn(
      '[STRIPE_WEBHOOK] No matching order for payment_intent:',
      paymentIntent.id
    )
    return NextResponse.json({ received: true })
  }

  // Idempotency: if we've already marked this order paid, stop here.
  if (order.payment_status === 'paid') {
    console.log(
      `[STRIPE_WEBHOOK] Order ${order.order_number} already marked paid — skipping.`
    )
    return NextResponse.json({ received: true })
  }

  const now = new Date().toISOString()

  // ── Mark order paid ────────────────────────────────────────
  await admin
    .from('orders')
    .update({ payment_status: 'paid', updated_at: now })
    .eq('id', order.id)

  // ── Mark invoices paid + locked ────────────────────────────
  await admin
    .from('invoices')
    .update({ status: 'paid', paid_at: now, locked: true, updated_at: now })
    .eq('order_id', order.id)

  // ── Determine payment method (card vs ACH) from charge ─────
  const charge = paymentIntent.latest_charge
    ? typeof paymentIntent.latest_charge === 'string'
      ? null
      : paymentIntent.latest_charge
    : null
  const pmType = charge?.payment_method_details?.type ?? 'card'
  const resolvedMethod = pmType === 'us_bank_account' ? 'ach' : 'card'

  // ── Create payment row ─────────────────────────────────────
  await admin.from('payments').insert({
    order_id: order.id,
    clinic_id: order.clinic_id,
    amount: paymentIntent.amount / 100,
    method: resolvedMethod,
    status: 'paid',
    stripe_payment_intent_id: paymentIntent.id,
    confirmed_at: now,
  })

  // ── Clinic counter + tier upgrade (parity with wire-confirm) ──
  const { data: clinic } = await admin
    .from('clinics')
    .select('*')
    .eq('id', order.clinic_id)
    .single()

  if (clinic) {
    const previousCount = clinic.completed_order_count
    const newCount = previousCount + 1

    const clinicUpdate: Record<string, unknown> = {
      completed_order_count: newCount,
    }

    // First completed order: upgrade tier (card is already enabled for card
    // orders, so the card_enabled flag is redundant here, but we set it for
    // explicit consistency with the wire flow).
    if (previousCount === 0) {
      clinicUpdate.tier = 'returning'
      clinicUpdate.card_enabled = true
    }

    await admin.from('clinics').update(clinicUpdate).eq('id', order.clinic_id)

    if (previousCount === 0) {
      await writeAuditLog(admin, {
        userId: null, // Webhook has no user context
        action: AUDIT_ACTIONS.CLINIC_TIER_UPGRADED,
        entityType: 'clinic',
        entityId: order.clinic_id,
        beforeState: { tier: 'new', completed_order_count: 0 },
        afterState: {
          tier: 'returning',
          completed_order_count: 1,
          card_enabled: true,
        },
        reason: `First card payment cleared via Stripe webhook (order ${order.order_number})`,
      })
    }

    // Calculate total spend for GHL sync. Match the dashboard rule:
    // both 'paid' (card) and 'confirmed' (wire) count as completed.
    const { data: allOrders } = await admin
      .from('orders')
      .select('total')
      .eq('clinic_id', order.clinic_id)
      .in('payment_status', ['paid', 'confirmed'])

    const totalSpend = (allOrders || []).reduce(
      (sum, o) => sum + (o.total ?? 0),
      0
    )

    // GHL sync (fire-and-forget). We reuse syncWireConfirmed because the
    // downstream effect is identical: contact gets the WIRE_CONFIRMED tag,
    // WIRE_VERIFIED custom field flips true, total_orders / total_spend
    // get refreshed, and the account tier label flips to "Returning".
    syncWireConfirmed({
      clinicEmail: clinic.primary_email,
      totalOrders: newCount,
      totalSpend,
      isFirstWire: previousCount === 0,
    }).catch(() => {})
  }

  // ── Audit log for the payment itself ───────────────────────
  await writeAuditLog(admin, {
    userId: null,
    action: AUDIT_ACTIONS.PAYMENT_RECEIVED,
    entityType: 'order',
    entityId: order.id,
    afterState: {
      order_number: order.order_number,
      payment_method: resolvedMethod,
      amount: paymentIntent.amount / 100,
      stripe_payment_intent_id: paymentIntent.id,
    },
  })

  console.log(
    `[STRIPE_WEBHOOK] Payment confirmed for order ${order.order_number}`
  )

  return NextResponse.json({ received: true })
}
