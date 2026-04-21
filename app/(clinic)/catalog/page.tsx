import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductGrid, type CatalogItem } from '@/components/catalog/product-grid'
import { CatalogCartButton } from '@/components/catalog/catalog-cart-button'
import type { Metadata } from 'next'
import type { BundleSnapshot } from '@/lib/types/database'

export const metadata: Metadata = {
  title: 'Product Catalog | Matrix Advanced Solutions',
  description: 'Browse our professional product catalog. For qualified clinics and providers.',
}

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient()

  const [productsRes, bundlesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('category')
      .order('name'),
    supabase
      .from('product_bundles')
      .select('*, items:product_bundle_items(product_id, quantity, product:products(id, sku, name))')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order')
      .order('name'),
  ])

  if (productsRes.error) console.error('Failed to fetch products:', productsRes.error)
  if (bundlesRes.error) console.error('Failed to fetch bundles:', bundlesRes.error)

  const products: CatalogItem[] = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    kind: 'product',
    name: p.name,
    sku: p.sku,
    category: p.category,
    unit: p.unit,
    prices: p.prices,
    costs: p.costs,
    image_url: p.image_url,
    is_featured: p.is_featured,
    description: p.description,
  }))

  type BundleRow = {
    id: string
    name: string
    sku: string
    category: string
    prices: number[]
    image_url: string | null
    is_featured: boolean
    description: string | null
    items: Array<{
      product_id: string
      quantity: number
      product: { id: string; sku: string; name: string } | null
    }>
  }

  const bundles: CatalogItem[] = ((bundlesRes.data ?? []) as unknown as BundleRow[]).map((b) => {
    const snapshot: BundleSnapshot = {
      bundle_sku: b.sku,
      bundle_name: b.name,
      components: b.items.map((it) => ({
        product_id: it.product_id,
        sku: it.product?.sku ?? '',
        name: it.product?.name ?? '',
        quantity: it.quantity,
      })),
    }
    return {
      id: b.id,
      kind: 'bundle',
      name: b.name,
      sku: b.sku,
      category: b.category,
      unit: 'bundle',
      prices: b.prices,
      costs: [0, 0, 0, 0],
      image_url: b.image_url,
      is_featured: b.is_featured,
      description: b.description,
      bundle_snapshot: snapshot,
    }
  })

  // Featured first (bundles then products), then the rest mixed in by type
  const items: CatalogItem[] = [
    ...bundles.filter((b) => b.is_featured),
    ...products.filter((p) => p.is_featured),
    ...bundles.filter((b) => !b.is_featured),
    ...products.filter((p) => !p.is_featured),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Product Catalog</h1>
          <p className="mt-2 text-steel-400">
            Professional use only. For qualified clinics and providers.
          </p>
        </div>
        <CatalogCartButton />
      </div>
      <ProductGrid products={items} />
    </div>
  )
}
