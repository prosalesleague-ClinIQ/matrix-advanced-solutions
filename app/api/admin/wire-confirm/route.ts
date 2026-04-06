import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import { syncWireConfirmed } from '@/lib/ghl/sync'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) {
    return null
  }

  return user
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, wireReference } = body

    if (!orderId || !wireReference) {
      return NextResponse.json(
        { error: 'orderId and wireReference are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Fetch order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status !== 'awaiting_wire') {
      return NextResponse.json(
        { error: `Order payment status is '${order.payment_status}', expected 'awaiting_wire'` },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Update order
    const { error: updateOrderError } = await admin
      .from('orders')
      .update({
        payment_status: 'confirmed',
        wire_reference: wireReference,
        wire_confirmed_by: user.id,
        wire_confirmed_at: now,
      })
      .eq('id', orderId)

    if (updateOrderError) {
      console.error('[WIRE_CONFIRM] Order update error:', updateOrderError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Create payment record
    const { error: paymentError } = await admin.from('payments').insert({
      order_id: orderId,
      clinic_id: order.clinic_id,
      amount: order.total,
      method: 'wire',
      status: 'confirmed',
      wire_reference: wireReference,
      confirmed_by: user.id,
      confirmed_at: now,
    })

    if (paymentError) {
      console.error('[WIRE_CONFIRM] Payment create error:', paymentError)
      // Non-fatal — order is already confirmed
    }

    // Update consulting invoice (first invoice for this order)
    const { data: invoice } = await admin
      .from('invoices')
      .select('id')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (invoice) {
      await admin
        .from('invoices')
        .update({ status: 'paid', paid_at: now, locked: true })
        .eq('id', invoice.id)
    }

    // Fetch clinic and increment completed_order_count
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

      // First order: upgrade tier and enable card
      if (previousCount === 0) {
        clinicUpdate.tier = 'returning'
        clinicUpdate.card_enabled = true
      }

      await admin
        .from('clinics')
        .update(clinicUpdate)
        .eq('id', order.clinic_id)

      if (previousCount === 0) {
        await writeAuditLog(admin, {
          userId: user.id,
          action: AUDIT_ACTIONS.CLINIC_TIER_UPGRADED,
          entityType: 'clinic',
          entityId: order.clinic_id,
          beforeState: { tier: 'new', completed_order_count: 0 },
          afterState: { tier: 'returning', completed_order_count: 1, card_enabled: true },
        })
      }

      // Calculate total spend for GHL sync
      const { data: allOrders } = await admin
        .from('orders')
        .select('total')
        .eq('clinic_id', order.clinic_id)
        .eq('payment_status', 'confirmed')

      const totalSpend = (allOrders || []).reduce((sum, o) => sum + o.total, 0)

      // GHL sync (fire-and-forget)
      syncWireConfirmed({
        clinicEmail: clinic.primary_email,
        totalOrders: newCount,
        totalSpend,
        isFirstWire: previousCount === 0,
      }).catch(() => {})
    }

    // Audit log for wire confirmation
    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.WIRE_CONFIRMED,
      entityType: 'order',
      entityId: orderId,
      beforeState: { payment_status: 'awaiting_wire' },
      afterState: {
        payment_status: 'confirmed',
        wire_reference: wireReference,
        wire_confirmed_by: user.id,
      },
    })

    return NextResponse.json({
      status: 'confirmed',
      orderId,
      orderNumber: order.order_number,
    })
  } catch (err) {
    console.error('[WIRE_CONFIRM] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
