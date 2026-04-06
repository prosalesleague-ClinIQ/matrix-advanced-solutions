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
    const supplierId = searchParams.get('supplier_id')

    const admin = createAdminClient()
    let query = admin.from('products').select('*').order('created_at', { ascending: false })

    if (active === 'true') {
      query = query.eq('is_active', true)
    } else if (active === 'false') {
      query = query.eq('is_active', false)
    }

    if (supplierId) {
      query = query.eq('supplier_id', supplierId)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('[ADMIN_PRODUCTS] List error:', error)
      return NextResponse.json({ error: 'Failed to list products' }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (err) {
    console.error('[ADMIN_PRODUCTS] Unexpected error:', err)
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
    const { name, sku, category, unit, description, prices, costs, supplier_id, image_url } = body

    // Validate required fields
    if (!name || !sku || !category || !unit) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, category, unit' },
        { status: 400 }
      )
    }

    if (!Array.isArray(prices) || prices.length !== 4 || !prices.every((p: unknown) => typeof p === 'number')) {
      return NextResponse.json(
        { error: 'prices must be a 4-element number array' },
        { status: 400 }
      )
    }

    if (!Array.isArray(costs) || costs.length !== 4 || !costs.every((c: unknown) => typeof c === 'number')) {
      return NextResponse.json(
        { error: 'costs must be a 4-element number array' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Check duplicate SKU
    const { data: existing } = await admin
      .from('products')
      .select('id')
      .eq('sku', sku)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'A product with this SKU already exists' }, { status: 409 })
    }

    const { data: product, error } = await admin
      .from('products')
      .insert({
        name,
        sku,
        category,
        unit,
        description: description ?? null,
        prices,
        costs,
        supplier_id: supplier_id ?? null,
        image_url: image_url ?? null,
      })
      .select()
      .single()

    if (error || !product) {
      console.error('[ADMIN_PRODUCTS] Create error:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entityType: 'product',
      entityId: product.id,
      afterState: { name, sku, category, unit, prices, costs },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_PRODUCTS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
