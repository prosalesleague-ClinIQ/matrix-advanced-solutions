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

    const { data: product, error: fetchError } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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
    const {
      name,
      sku,
      category,
      unit,
      description,
      prices,
      costs,
      supplier_id,
      image_url,
      is_active,
    } = body

    const admin = createAdminClient()

    // Fetch current product
    const { data: existing, error: fetchError } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check SKU conflict if changing
    if (sku && sku !== existing.sku) {
      const { data: conflict } = await admin
        .from('products')
        .select('id')
        .eq('sku', sku)
        .neq('id', id)
        .maybeSingle()

      if (conflict) {
        return NextResponse.json(
          { error: 'A product with this SKU already exists' },
          { status: 409 }
        )
      }
    }

    // Validate prices/costs arrays if provided
    if (prices !== undefined) {
      if (!Array.isArray(prices) || prices.length !== 4 || !prices.every((p: unknown) => typeof p === 'number')) {
        return NextResponse.json({ error: 'prices must be a 4-element number array' }, { status: 400 })
      }
    }

    if (costs !== undefined) {
      if (!Array.isArray(costs) || costs.length !== 4 || !costs.every((c: unknown) => typeof c === 'number')) {
        return NextResponse.json({ error: 'costs must be a 4-element number array' }, { status: 400 })
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku
    if (category !== undefined) updateData.category = category
    if (unit !== undefined) updateData.unit = unit
    if (description !== undefined) updateData.description = description
    if (prices !== undefined) updateData.prices = prices
    if (costs !== undefined) updateData.costs = costs
    if (supplier_id !== undefined) updateData.supplier_id = supplier_id
    if (image_url !== undefined) updateData.image_url = image_url
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: product, error: updateError } = await admin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !product) {
      console.error('[ADMIN_PRODUCTS] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      entityType: 'product',
      entityId: id,
      beforeState: existing as unknown as Json,
      afterState: updateData as unknown as Json,
    })

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[ADMIN_PRODUCTS] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
