import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const admin = createAdminClient()

    // Verify batch exists
    const { data: batch, error: batchError } = await admin
      .from('batch_pos')
      .select('id, batch_number, status')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch PO not found' }, { status: 404 })
    }

    // Get orders in this batch with tracking info
    const { data: orders, error: ordersError } = await admin
      .from('orders')
      .select('id, order_number, tracking_number, shipped_at, delivered_at, status, clinic_id')
      .eq('batch_po_id', id)

    if (ordersError) {
      console.error('[BATCH_TRACKING] Query error:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch tracking info' }, { status: 500 })
    }

    return NextResponse.json({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      batchStatus: batch.status,
      orders: orders ?? [],
    })
  } catch (err) {
    console.error('[BATCH_TRACKING] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { orderId, trackingNumber } = body

    if (!orderId || !trackingNumber) {
      return NextResponse.json(
        { error: 'orderId and trackingNumber are required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Verify batch exists
    const { data: batch, error: batchError } = await admin
      .from('batch_pos')
      .select('id')
      .eq('id', id)
      .single()

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch PO not found' }, { status: 404 })
    }

    // Verify order belongs to this batch
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, order_number, tracking_number')
      .eq('id', orderId)
      .eq('batch_po_id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found in this batch' },
        { status: 404 }
      )
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', orderId)

    if (updateError) {
      console.error('[BATCH_TRACKING] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update tracking number' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BATCH_TRACKING_UPDATED,
      entityType: 'order',
      entityId: orderId,
      beforeState: { tracking_number: order.tracking_number },
      afterState: { tracking_number: trackingNumber, batch_po_id: id },
    })

    return NextResponse.json({
      orderId,
      orderNumber: order.order_number,
      trackingNumber,
    })
  } catch (err) {
    console.error('[BATCH_TRACKING] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
