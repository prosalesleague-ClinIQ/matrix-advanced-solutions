import type { Json } from "@/lib/types/database"
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
    const { name, email, phone, ghlUserId, notes, is_active } = body

    const admin = createAdminClient()

    // Fetch current sales rep
    const { data: existing, error: fetchError } = await admin
      .from('sales_reps')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (ghlUserId !== undefined) updateData.ghl_user_id = ghlUserId
    if (notes !== undefined) updateData.notes = notes
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: salesRep, error: updateError } = await admin
      .from('sales_reps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !salesRep) {
      console.error('[ADMIN_SALES_REPS] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update sales rep' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.SALES_REP_UPDATED,
      entityType: 'sales_rep',
      entityId: id,
      beforeState: existing as unknown as Json,
      afterState: updateData as unknown as Json,
    })

    return NextResponse.json({ salesRep })
  } catch (err) {
    console.error('[ADMIN_SALES_REPS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
