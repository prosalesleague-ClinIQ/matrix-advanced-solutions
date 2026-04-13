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

// ─── GET: list bundles (admin only) ───────────────────────────
export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    let query = admin
      .from('product_bundles')
      .select('*, items:product_bundle_items(*, product:products(*))')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bundles: data ?? [] })
  } catch (err) {
    console.error('[ADMIN_BUNDLES] GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST: create a bundle with items ──────────────────────────
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const user = await requireAdmin(supabase)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Bundle name is required' }, { status: 400 })
    }
    if (!sku || typeof sku !== 'string' || sku.trim().length < 2) {
      return NextResponse.json({ error: 'Bundle SKU is required' }, { status: 400 })
    }
    if (!Array.isArray(prices) || prices.length !== 4 || !prices.every((p: unknown) => typeof p === 'number' && p >= 0)) {
      return NextResponse.json({ error: 'prices must be a 4-element number array' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Bundle must contain at least one product' }, { status: 400 })
    }
    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return NextResponse.json({ error: 'Each item requires a productId' }, { status: 400 })
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: 'Each item quantity must be a positive integer' }, { status: 400 })
      }
    }

    const admin = createAdminClient()

    // SKU uniqueness
    const { data: existingSku } = await admin
      .from('product_bundles')
      .select('id')
      .eq('sku', sku.trim())
      .maybeSingle()
    if (existingSku) {
      return NextResponse.json({ error: 'A bundle with this SKU already exists' }, { status: 409 })
    }

    // Verify all component products exist and are active
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

    // Create the bundle
    const { data: bundle, error: bundleError } = await admin
      .from('product_bundles')
      .insert({
        name: name.trim(),
        sku: sku.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'Bundles',
        prices,
        image_url: image_url || null,
        is_active: is_active ?? true,
        is_featured: is_featured ?? false,
        display_order: display_order ?? 0,
      })
      .select()
      .single()

    if (bundleError || !bundle) {
      console.error('[ADMIN_BUNDLES] create bundle error:', bundleError)
      return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 })
    }

    // Insert items (rollback bundle if items fail)
    const itemRows = items.map((item: { productId: string; quantity: number; displayOrder?: number }, idx: number) => ({
      bundle_id: bundle.id,
      product_id: item.productId,
      quantity: item.quantity,
      display_order: item.displayOrder ?? idx,
    }))
    const { error: itemsError } = await admin.from('product_bundle_items').insert(itemRows)
    if (itemsError) {
      console.error('[ADMIN_BUNDLES] insert items error:', itemsError)
      await admin.from('product_bundles').delete().eq('id', bundle.id)
      return NextResponse.json({ error: 'Failed to create bundle items' }, { status: 500 })
    }

    // Audit
    await writeAuditLog(admin, {
      userId: user.id,
      action: AUDIT_ACTIONS.BUNDLE_CREATED,
      entityType: 'bundle',
      entityId: bundle.id,
      afterState: { bundle, items: itemRows } as unknown as Json,
    })

    // Return with items joined
    const { data: full } = await admin
      .from('product_bundles')
      .select('*, items:product_bundle_items(*, product:products(*))')
      .eq('id', bundle.id)
      .single()

    return NextResponse.json({ bundle: full ?? bundle }, { status: 201 })
  } catch (err) {
    console.error('[ADMIN_BUNDLES] POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
