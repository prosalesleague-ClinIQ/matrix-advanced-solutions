import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse request ──────────────────────────────────────────
    const { orderId } = (await request.json()) as { orderId: string }

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    // ── Fetch user profile ─────────────────────────────────────
    const { data: profile } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single()

    if (!profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User clinic not found' },
        { status: 400 }
      )
    }

    // ── Fetch order (verify ownership) ─────────────────────────
    const admin = createAdminClient()

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('clinic_id', profile.clinic_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.payment_status === 'paid' || order.payment_status === 'confirmed') {
      return NextResponse.json(
        { error: 'This order has already been paid' },
        { status: 400 }
      )
    }

    const stripe = getStripe()

    // ── Return existing PaymentIntent if present ───────────────
    if (order.stripe_payment_intent_id) {
      try {
        const existingPI = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id
        )

        // Only reuse if the intent is still usable
        if (
          existingPI.status === 'requires_payment_method' ||
          existingPI.status === 'requires_confirmation' ||
          existingPI.status === 'requires_action'
        ) {
          return NextResponse.json({
            clientSecret: existingPI.client_secret,
          })
        }
      } catch {
        // PI retrieval failed — create a new one below
      }
    }

    // ── Ensure Stripe customer exists (and matches current mode) ──
    // When the account switches between test and live, previously-saved
    // customer IDs from the other mode are invalid. Verify the ID still
    // resolves in the current mode; if not, create a fresh customer.
    const { data: clinic } = await admin
      .from('clinics')
      .select('stripe_customer_id, primary_email, name')
      .eq('id', profile.clinic_id)
      .single()

    let stripeCustomerId: string | null = clinic?.stripe_customer_id ?? null

    if (stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId)
        if ((existing as { deleted?: boolean }).deleted) {
          stripeCustomerId = null
        }
      } catch {
        // Customer doesn't exist in the current mode — clear and recreate.
        stripeCustomerId = null
      }
    }

    if (!stripeCustomerId && clinic) {
      const customer = await stripe.customers.create({
        email: clinic.primary_email,
        name: clinic.name,
        metadata: { clinic_id: profile.clinic_id },
      })
      stripeCustomerId = customer.id

      await admin
        .from('clinics')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', profile.clinic_id)
    }

    // ── Create new PaymentIntent ───────────────────────────────
    // Uses automatic_payment_methods so Stripe serves whatever payment
    // methods are enabled on the account (card, ACH, etc.) based on the
    // dashboard settings. This avoids account-config mismatches that
    // happen when we hardcode payment_method_types.
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.total * 100),
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        ...(stripeCustomerId && { customer: stripeCustomerId }),
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          clinic_id: profile.clinic_id,
        },
      })
    } catch (createErr) {
      const msg = createErr instanceof Error ? createErr.message : 'unknown'
      console.error('[CREATE_INTENT] Stripe create failed:', msg)
      return NextResponse.json(
        { error: `Stripe: ${msg}` },
        { status: 500 }
      )
    }

    // Store PI ID on order
    await admin
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    console.error('[CREATE_INTENT] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
