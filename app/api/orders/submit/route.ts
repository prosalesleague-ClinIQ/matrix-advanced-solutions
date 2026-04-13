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
import type { Product, Json } from '@/lib/types/database'

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

    // ── Get user profile ───────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 400 }
      )
    }

    const isAdmin = ['matrix_admin', 'matrix_staff'].includes(profile.role)

    // ── Parse + validate request body ──────────────────────────
    const body: OrderSubmitRequest & { clinicId?: string; overrideTierGate?: boolean } = await request.json()
    const { items, shippingMethod, shippingAddress, paymentMethod, notes } = body

    // Admins can place orders on behalf of a clinic by passing clinicId.
    // Clinic users always order for their own clinic.
    const clinicId = isAdmin && body.clinicId ? body.clinicId : profile.clinic_id
    const overrideTierGate = isAdmin && body.overrideTierGate === true

    if (!clinicId) {
      return NextResponse.json(
        { error: 'No clinic specified' },
        { status: 400 }
      )
    }

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

    const allowedMethods = isAdmin ? ['wire', 'card', 'ach'] : ['wire', 'card']
    if (!allowedMethods.includes(paymentMethod)) {
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

    // New clinics cannot pay by card — unless an admin is overriding the gate
    if (paymentMethod === 'card' && clinic.tier === 'new' && !overrideTierGate) {
      return NextResponse.json(
        { error: 'Card payments are not available for new clinic accounts. Please use wire transfer.' },
        { status: 403 }
      )
    }

    // ── Split items into products and bundles ─────────────────
    const productLineIds = items
      .filter((i) => i.kind !== 'bundle')
      .map((i) => i.productId)
    const bundleLineIds = items
      .filter((i) => i.kind === 'bundle')
      .map((i) => i.productId)

    // Fetch active products referenced by the order
    let productMap = new Map<string, Product>()
    if (productLineIds.length > 0) {
      const { data: products, error: productsError } = await admin
        .from('products')
        .select('*')
        .in('id', productLineIds)
        .eq('is_active', true)

      if (productsError || !products) {
        return NextResponse.json(
          { error: 'Failed to validate products' },
          { status: 500 }
        )
      }
      if (products.length !== productLineIds.length) {
        return NextResponse.json(
          { error: 'One or more products are unavailable' },
          { status: 400 }
        )
      }
      productMap = new Map(products.map((p) => [p.id, p]))
    }

    // Fetch active bundles referenced by the order, with their components
    type BundleWithComponents = {
      id: string
      sku: string
      name: string
      prices: number[]
      is_active: boolean
      items: Array<{
        product_id: string
        quantity: number
        product: { id: string; sku: string; name: string; costs: number[] }
      }>
    }
    const bundleMap = new Map<string, BundleWithComponents>()
    if (bundleLineIds.length > 0) {
      const { data: bundles, error: bundlesError } = await admin
        .from('product_bundles')
        .select('id, sku, name, prices, is_active, items:product_bundle_items(product_id, quantity, product:products(id, sku, name, costs))')
        .in('id', bundleLineIds)
        .eq('is_active', true)

      if (bundlesError || !bundles) {
        return NextResponse.json(
          { error: 'Failed to validate bundles' },
          { status: 500 }
        )
      }
      if (bundles.length !== bundleLineIds.length) {
        return NextResponse.json(
          { error: 'One or more bundles are unavailable' },
          { status: 400 }
        )
      }
      for (const b of bundles as unknown as BundleWithComponents[]) {
        bundleMap.set(b.id, b)
      }
    }

    // ── Calculate pricing ──────────────────────────────────────
    let subtotal = 0
    let totalCost = 0
    const orderItemsData: Array<{
      product_id: string | null
      bundle_id: string | null
      bundle_snapshot: Json | null
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
      if (item.kind === 'bundle') {
        const bundle = bundleMap.get(item.productId)
        if (!bundle) continue

        const unitPrice = getUnitPrice(bundle.prices, item.quantity)
        const lineTotal = getLineTotal(bundle.prices, item.quantity)
        // Bundle cost = sum of component costs × component quantity × bundle quantity
        const unitCost = bundle.items.reduce(
          (sum, comp) => sum + (comp.product?.costs?.[0] ?? 0) * comp.quantity,
          0
        )
        const lineCost = unitCost * item.quantity
        const tierApplied = getTierLabel(item.quantity)

        subtotal += lineTotal
        totalCost += lineCost

        orderItemsData.push({
          product_id: null,
          bundle_id: bundle.id,
          bundle_snapshot: {
            bundle_sku: bundle.sku,
            bundle_name: bundle.name,
            components: bundle.items.map((c) => ({
              product_id: c.product_id,
              sku: c.product?.sku ?? '',
              name: c.product?.name ?? '',
              quantity: c.quantity,
            })),
          } as unknown as Json,
          sku: bundle.sku,
          product_name: bundle.name,
          quantity: item.quantity,
          unit_price: unitPrice,
          unit_cost: unitCost,
          tier_applied: tierApplied,
          line_total: lineTotal,
          line_cost: lineCost,
        })
      } else {
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
          bundle_id: null,
          bundle_snapshot: null,
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
        placed_on_behalf: isAdmin && body.clinicId ? true : false,
        clinic_id: clinicId,
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
