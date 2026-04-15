/**
 * PUT /api/admin/orders/[id]/status
 *
 * Admin endpoint for advancing an order through its fulfillment lifecycle.
 * Accepts any subset of:
 *   - status         — order.status ('submitted' → 'confirmed' → 'processing' → 'shipped' → 'delivered' → 'cancelled')
 *   - mfg_status     — order.mfg_status ('pending' → 'batched' → 'in_production' → 'shipped' → 'received')
 *   - tracking_number — carrier tracking number
 *   - notes          — admin notes (append-safe: the full string is replaced, not appended)
 *
 * Enforces valid status transitions (no skipping states, no going backward
 * except to cancelled). Writes an audit log entry for every change.
 */

import type { Json } from '@/lib/types/database'
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) return null
  return user
}

// Valid forward transitions for order.status.
// Any state can also transition to 'cancelled'.
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

// Valid forward transitions for order.mfg_status.
const MFG_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['batched'],
  batched: ['in_production'],
  in_production: ['shipped'],
  shipped: ['received'],
  received: [],
}

export async function PUT(
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
    const { status, mfg_status, tracking_number, notes } = body

    const admin = createAdminClient()

    // Fetch current order
    const { data: existing, error: fetchError } = await admin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transitions
    if (status !== undefined && status !== existing.status) {
      const allowed = ORDER_STATUS_TRANSITIONS[existing.status] ?? []
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `Cannot transition order from "${existing.status}" to "${status}". Allowed: ${allowed.join(', ') || '(terminal state)'}`,
          },
          { status: 400 }
        )
      }
    }

    if (mfg_status !== undefined && mfg_status !== existing.mfg_status) {
      const allowed = MFG_STATUS_TRANSITIONS[existing.mfg_status] ?? []
      if (!allowed.includes(mfg_status)) {
        return NextResponse.json(
          {
            error: `Cannot transition mfg status from "${existing.mfg_status}" to "${mfg_status}". Allowed: ${allowed.join(', ') || '(terminal state)'}`,
          },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (status !== undefined) updateData.status = status
    if (mfg_status !== undefined) updateData.mfg_status = mfg_status
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number || null
    if (notes !== undefined) updateData.notes = notes || null

    // If transitioning to shipped, stamp shipped_at
    if (status === 'shipped' && existing.status !== 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    }
    // If transitioning to delivered, stamp delivered_at
    if (status === 'delivered' && existing.status !== 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error: updateError } = await admin
      .from('orders')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('[ADMIN_ORDER_STATUS] update error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Audit log
    await writeAuditLog(admin, {
      userId: user.id,
      action:
        status && status !== existing.status
          ? AUDIT_ACTIONS.ORDER_STATUS_CHANGED
          : AUDIT_ACTIONS.ORDER_CONFIRMED,
      entityType: 'order',
      entityId: id,
      beforeState: {
        status: existing.status,
        mfg_status: existing.mfg_status,
        tracking_number: existing.tracking_number,
      } as unknown as Json,
      afterState: updateData as unknown as Json,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_ORDER_STATUS] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
