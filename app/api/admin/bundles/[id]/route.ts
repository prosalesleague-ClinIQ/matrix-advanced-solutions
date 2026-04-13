import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/audit'
import type { Json } from '@/lib/types/database'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || !['matrix_admin', 'matrix_staff'].includes(profile.role)) return null
  return user
}

// ─── GET: fetch single bundle with items ───────────────────────
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

    const { data: bundle, error } = await admin
      .from('product_bundles')
      .select('*, items:product_bundle_items(*, product:products(*))')
      .eq('id', id)
      .single()

    if (error || !bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    return NextResponse.json({ bundle })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PUT: update bundle + optionally replace items ─────────────
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
      description,
      category,
      prices,
      image_url,
      is_active,
      is_featured,
      display_order,
      items,
    } = body

    const admin = createAdminClient()

    const { data: existing, error: fetchError } = await admin
      .from('product_bundles')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    // SKU conflict check
    if (sku && sku !== existing.sku) {
      const { data: conflict } = await admin
        .from('product_bundles')
        .select('id')
        .eq('sku', sku)
        .neq('id', id)
        .maybeSingle()
      if (conflict) {
        return NextResponse.json({ error: 'A bundle with this SKU already exists' }, { status: 409 })
      }
    }

    // Validate prices if provided
    if (prices !== undefined) {
      if (!Array.isArray(prices) || prices.length !== 4 || !prices.every((p: unknown) => typeof p === 'number' && p >= 0)) {
        return NextResponse.json({ error: 'prices must be a 4-element non-negative number array' }, { status: 400 })
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (sku !== undefined) updateData.sku = sku.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (category !== undefined) updateData.category = category
    if (prices !== undefined) updateData.prices = prices
    if (image_url !== undefined) updateData.image_url = image_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (is_featured !== undefined) updateData.is_featured = is_featured
    if (display_order !== undefined) updateData.display_order = display_order

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await admin
        .from('product_bundles')
        .update(updateData)
        .eq('id', id)
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }

    // Optional items replacement
    if (Array.isArray(items)) {
      if (items.length === 0) {
        return NextResponse.json({ error: 'Bundle must contain at least one product' }, { status: 400 })
      }
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
          return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
        }
      }

      const productIds = items.map((i: { productId: string }) => i.productId)
      const { data: products } = await admin
        .from('products')
        .select('id, is_active')
        .in('id', productIds)
      if (!products || products.length !== productIds.length) {
        return NextResponse.json({ error: 'One or more products not found' }, { status: 400 })
      }
      if (products.some((p: { is_active: boolean }) => !p.is_active)) {
        return NextResponse.json({ error: 'All bundle components must be active products' }, { status: 400 })
      }

      // Replace items
      await admin.from('product_bundle_items').delete().eq('bundle_id', id)
      const itemRows = items.map((item: { productId: string; quantity: number; displayOrder?: number }, idx: number) => ({
        bundle_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        display_order: item.displayOrder ?? idx,
      }))
      const { error: itemsError } = await admin.from('product_bundle_items').insert(itemRows)
      if (itemsError) {
        return NextResponse.json({ error: 'Failed to update bundle items' }, { status: 500 })
      }
    }

    // Audit
    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BUNDLE_UPDATED,
      entityType: 'bundle',
      entityId: id,
      beforeState: existing as unknown as Json,
      afterState: { ...updateData, items } as unknown as Json,
    })

    const { data: full } = await admin
      .from('product_bundles')
      .select('*, items:product_bundle_items(*, product:products(*))')
      .eq('id', id)
      .single()

    return NextResponse.json({ bundle: full })
  } catch (err) {
    console.error('[ADMIN_BUNDLES] PUT error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE: hard delete, blocked if referenced by orders ──────
export async function DELETE(
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

    // Block if referenced by any order_items
    const { count } = await admin
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('bundle_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete — bundle is referenced by existing orders. Deactivate instead.' },
        { status: 409 }
      )
    }

    const { data: existing } = await admin
      .from('product_bundles')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await admin.from('product_bundles').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BUNDLE_DELETED,
      entityType: 'bundle',
      entityId: id,
      beforeState: existing as unknown as Json,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
