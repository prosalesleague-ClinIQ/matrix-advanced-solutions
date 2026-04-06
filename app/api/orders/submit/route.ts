import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { getUnitPrice, getUnitCost, getLineTotal, getTierLabel } from '@/lib/pricing'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { syncOrderPlaced } from '@/lib/ghl/sync'
import { SHIPPING_METHODS, WIRE_INSTRUCTIONS } from '@/lib/constants'
import type { OrderSubmitRequest, OrderSubmitResponse } from '@/lib/types/orders'
import type { ShippingMethod } from '@/lib/constants'

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

    // ── Get user profile + clinic ──────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.clinic_id) {
      return NextResponse.json(
        { error: 'User profile or clinic not found' },
        { status: 400 }
      )
    }

    const clinicId = profile.clinic_id

    // ── Parse + validate request body ──────────────────────────
    const body: OrderSubmitRequest = await request.json()
    const { items, shippingMethod, shippingAddress, paymentMethod, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 }
      )
    }

    if (!shippingAddress?.trim()) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    if (!['wire', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    const validShippingMethods: ShippingMethod[] = ['standard', 'express', 'overnight']
    if (!validShippingMethods.includes(shippingMethod)) {
      return NextResponse.json(
        { error: 'Invalid shipping method' },
        { status: 400 }
      )
    }

    // ── Fetch clinic (to check tier for card eligibility) ──────
    const admin = createAdminClient()

    const { data: clinic, error: clinicError } = await admin
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .single()

    if (clinicError || !clinic) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 400 }
      )
    }

    // New clinics cannot pay by card
    if (paymentMethod === 'card' && clinic.tier === 'new') {
      return NextResponse.json(
        { error: 'Card payments are not available for new clinic accounts. Please use wire transfer.' },
        { status: 403 }
      )
    }

    // ── Validate products exist and are active ─────────────────
    const productIds = items.map((i) => i.productId)
    const { data: products, error: productsError } = await admin
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to validate products' },
        { status: 500 }
      )
    }

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'One or more products are unavailable' },
        { status: 400 }
      )
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    // ── Calculate pricing ──────────────────────────────────────
    let subtotal = 0
    let totalCost = 0
    const orderItemsData: Array<{
      product_id: string
      sku: string
      product_name: string
      quantity: number
      unit_price: number
      unit_cost: number
      tier_applied: string
      line_total: number
      line_cost: number
    }> = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const unitPrice = getUnitPrice(product.prices, item.quantity)
      const unitCost = getUnitCost(product.costs, item.quantity)
      const lineTotal = getLineTotal(product.prices, item.quantity)
      const lineCost = unitCost * item.quantity
      const tierApplied = getTierLabel(item.quantity)

      subtotal += lineTotal
      totalCost += lineCost

      orderItemsData.push({
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        unit_cost: unitCost,
        tier_applied: tierApplied,
        line_total: lineTotal,
        line_cost: lineCost,
      })
    }

    const shippingCost = SHIPPING_METHODS[shippingMethod].price
    const total = subtotal + shippingCost

    // ── Create order ───────────────────────────────────────────
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        clinic_id: clinicId,
        status: 'submitted',
        payment_status: paymentMethod === 'wire' ? 'awaiting_wire' : 'pending',
        payment_method: paymentMethod,
        mfg_status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        total,
        total_cost: totalCost,
        shipping_method: shippingMethod,
        shipping_address: shippingAddress.trim(),
        notes: notes?.trim() || null,
        wire_reference:
          paymentMethod === 'wire' ? `Wire pending` : null,
        created_by: user.id,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('[ORDER_SUBMIT] Failed to create order:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // ── Create order items ─────────────────────────────────────
    const orderItemsInsert = orderItemsData.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await admin
      .from('order_items')
      .insert(orderItemsInsert)

    if (itemsError) {
      console.error('[ORDER_SUBMIT] Failed to create order items:', itemsError)
      // Clean up the order
      await admin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // ── Create consulting invoice ──────────────────────────────
    const invoiceLineItems = orderItemsData.map((item) => ({
      sku: item.sku,
      name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.line_total,
    }))

    const { error: invoiceError } = await admin.from('invoices').insert({
      order_id: order.id,
      clinic_id: clinicId,
      invoice_type: 'consulting',
      status: paymentMethod === 'wire' ? 'sent' : 'draft',
      line_items: invoiceLineItems,
      subtotal,
      tax: 0,
      total,
    })

    if (invoiceError) {
      console.error('[ORDER_SUBMIT] Failed to create invoice:', invoiceError)
      // Non-fatal — order is still valid
    }

    // ── Stripe PaymentIntent (card orders) ─────────────────────
    let stripeClientSecret: string | undefined

    if (paymentMethod === 'card') {
      try {
        const stripe = getStripe()

        // Ensure clinic has a Stripe customer
        let stripeCustomerId = clinic.stripe_customer_id
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: clinic.primary_email,
            name: clinic.name,
            metadata: { clinic_id: clinicId },
          })
          stripeCustomerId = customer.id

          await admin
            .from('clinics')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', clinicId)
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100),
          currency: 'usd',
          customer: stripeCustomerId,
          metadata: {
            order_id: order.id,
            order_number: order.order_number,
            clinic_id: clinicId,
          },
        })

        stripeClientSecret = paymentIntent.client_secret ?? undefined

        // Store PI ID on order
        await admin
          .from('orders')
          .update({ stripe_payment_intent_id: paymentIntent.id })
          .eq('id', order.id)
      } catch (stripeError) {
        console.error('[ORDER_SUBMIT] Stripe error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to initialize payment. Please try again.' },
          { status: 500 }
        )
      }
    }

    // ── Audit log ──────────────────────────────────────────────
    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.ORDER_SUBMITTED,
      entityType: 'order',
      entityId: order.id,
      afterState: {
        order_number: order.order_number,
        total,
        payment_method: paymentMethod,
        item_count: items.length,
      },
    })

    // ── GHL sync (fire-and-forget) ─────────────────────────────
    syncOrderPlaced({
      clinicEmail: clinic.primary_email,
      orderNumber: order.order_number,
      orderTotal: total,
      totalOrders: clinic.completed_order_count + 1,
      totalSpend: total,
    }).catch(() => {
      // GHL sync failures are non-blocking
    })

    // ── Response ───────────────────────────────────────────────
    const response: OrderSubmitResponse = {
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      paymentMethod,
      ...(paymentMethod === 'wire' && {
        wireInstructions: {
          bankName: WIRE_INSTRUCTIONS.bankName,
          routingNumber: WIRE_INSTRUCTIONS.routingNumber,
          accountNumber: WIRE_INSTRUCTIONS.accountNumber,
          accountName: WIRE_INSTRUCTIONS.accountName,
          reference: order.order_number,
        },
      }),
      ...(stripeClientSecret && { stripeClientSecret }),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (err) {
    console.error('[ORDER_SUBMIT] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
