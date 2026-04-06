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

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const admin = createAdminClient()
    let query = admin.from('suppliers').select('*').order('name')

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    const { data: suppliers, error } = await query

    if (error) {
      console.error('[ADMIN_SUPPLIERS] List error:', error)
      return NextResponse.json({ error: 'Failed to list suppliers' }, { status: 500 })
    }

    return NextResponse.json({ suppliers })
  } catch (err) {
    console.error('[ADMIN_SUPPLIERS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, contactName, contactEmail, contactPhone, address, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: supplier, error } = await admin
      .from('suppliers')
      .insert({
        name,
        contact_name: contactName ?? null,
        contact_email: contactEmail ?? null,
        contact_phone: contactPhone ?? null,
        address: address ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error || !supplier) {
      console.error('[ADMIN_SUPPLIERS] Create error:', error)
      return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.SUPPLIER_CREATED,
      entityType: 'supplier',
      entityId: supplier.id,
      afterState: { name, contactName, contactEmail, contactPhone },
    })

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_SUPPLIERS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
