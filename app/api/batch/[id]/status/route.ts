import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import type { BatchStatus } from '@/lib/types/database'

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['submitted'],
  submitted: ['acknowledged', 'draft'],
  acknowledged: ['in_production'],
  in_production: ['shipped'],
  shipped: ['received'],
}

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
    const { status, notes } = body as { status: BatchStatus; notes?: string }

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Fetch current batch
    const { data: batch, error: fetchError } = await admin
      .from('batch_pos')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !batch) {
      return NextResponse.json({ error: 'Batch PO not found' }, { status: 404 })
    }

    // Validate status transition
    const allowedNext = VALID_TRANSITIONS[batch.status]
    if (!allowedNext || !allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition: ${batch.status} -> ${status}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { status }
    if (notes !== undefined) updateData.notes = notes

    // Set timestamps for specific transitions
    if (status === 'submitted') {
      updateData.submitted_at = new Date().toISOString()
    }
    if (status === 'submitted') {
      updateData.submitted_to_supplier_at = new Date().toISOString()
    }

    const { data: updated, error: updateError } = await admin
      .from('batch_pos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updated) {
      console.error('[BATCH_STATUS] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update batch status' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BATCH_STATUS_UPDATED,
      entityType: 'batch_po',
      entityId: id,
      beforeState: { status: batch.status },
      afterState: { status, notes },
    })

    return NextResponse.json({ batch: updated })
  } catch (err) {
    console.error('[BATCH_STATUS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
