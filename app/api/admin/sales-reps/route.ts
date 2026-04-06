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
    let query = admin.from('sales_reps').select('*').order('name')

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    const { data: salesReps, error } = await query

    if (error) {
      console.error('[ADMIN_SALES_REPS] List error:', error)
      return NextResponse.json({ error: 'Failed to list sales reps' }, { status: 500 })
    }

    return NextResponse.json({ salesReps })
  } catch (err) {
    console.error('[ADMIN_SALES_REPS] Unexpected error:', err)
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
    const { name, email, phone, ghlUserId, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: salesRep, error } = await admin
      .from('sales_reps')
      .insert({
        name,
        email: email ?? null,
        phone: phone ?? null,
        ghl_user_id: ghlUserId ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error || !salesRep) {
      console.error('[ADMIN_SALES_REPS] Create error:', error)
      return NextResponse.json({ error: 'Failed to create sales rep' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.SALES_REP_CREATED,
      entityType: 'sales_rep',
      entityId: salesRep.id,
      afterState: { name, email, phone, ghlUserId },
    })

    return NextResponse.json({ salesRep }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_SALES_REPS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
