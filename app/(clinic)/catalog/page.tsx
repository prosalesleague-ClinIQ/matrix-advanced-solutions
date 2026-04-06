import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/catalog/product-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Catalog | Matrix Advanced Solutions',
  description: 'Browse our professional product catalog. For qualified clinics and providers.',
}

export default async function CatalogPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name')

  if (error) {
    console.error('Failed to fetch products:', error)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Product Catalog</h1>
        <p className="mt-2 text-steel-400">
          Professional use only. For qualified clinics and providers.
        </p>
      </div>
      <ProductGrid products={products ?? []} />
    </div>
  )
}
