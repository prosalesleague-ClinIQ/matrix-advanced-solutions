import Link from 'next/link'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, suppliers(name)')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Image</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">SKU</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Category</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Supplier</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 1</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 2</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 3</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 4</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => {
                const supplier = product.suppliers as unknown as { name: string } | null
                return (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                          <Package className="h-5 w-5 text-steel-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-accent-purple hover:text-accent-purple-light font-medium"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-steel-400">{product.sku}</td>
                    <td className="px-6 py-4 text-steel-300">{product.category}</td>
                    <td className="px-6 py-4 text-steel-300">{supplier?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-right text-steel-300">
                      {product.prices[0] != null ? formatCurrency(product.prices[0]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300">
                      {product.prices[1] != null ? formatCurrency(product.prices[1]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300">
                      {product.prices[2] != null ? formatCurrency(product.prices[2]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300">
                      {product.prices[3] != null ? formatCurrency(product.prices[3]) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={product.is_active ? 'accent' : 'default'}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-steel-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
