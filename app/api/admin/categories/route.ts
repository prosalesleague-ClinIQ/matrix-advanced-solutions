import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) return null
  return user
}

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('product_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
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

    const { name, display_order } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('product_categories')
      .insert({
        name: name.trim(),
        display_order: display_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, display_order, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name.trim()
    if (display_order !== undefined) updates.display_order = display_order
    if (is_active !== undefined) updates.is_active = is_active

    const { data, error } = await admin
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()
    const admin = createAdminClient()

    // Check if any products use this category
    const { data: cat } = await admin.from('product_categories').select('name').eq('id', id).single()
    if (cat) {
      const { count } = await admin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category', cat.name)

      if (count && count > 0) {
        return NextResponse.json(
          { error: `Cannot delete — ${count} product(s) use this category. Reassign them first.` },
          { status: 409 }
        )
      }
    }

    const { error } = await admin.from('product_categories').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
