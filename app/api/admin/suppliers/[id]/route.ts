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
    const { name, contactName, contactEmail, contactPhone, address, notes, is_active } = body

    const admin = createAdminClient()

    // Fetch current supplier
    const { data: existing, error: fetchError } = await admin
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (contactName !== undefined) updateData.contact_name = contactName
    if (contactEmail !== undefined) updateData.contact_email = contactEmail
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone
    if (address !== undefined) updateData.address = address
    if (notes !== undefined) updateData.notes = notes
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: supplier, error: updateError } = await admin
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !supplier) {
      console.error('[ADMIN_SUPPLIERS] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.SUPPLIER_UPDATED,
      entityType: 'supplier',
      entityId: id,
      beforeState: existing as unknown as Json,
      afterState: updateData as unknown as Json,
    })

    return NextResponse.json({ supplier })
  } catch (err) {
    console.error('[ADMIN_SUPPLIERS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
