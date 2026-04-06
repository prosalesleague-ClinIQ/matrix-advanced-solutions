import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export default async function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: supplier }, { data: products }] = await Promise.all([
    supabase.from('suppliers').select('*').eq('id', id).single(),
    supabase
      .from('products')
      .select('id, name, sku, category, prices, is_active')
      .eq('supplier_id', id)
      .order('name', { ascending: true }),
  ])

  if (!supplier) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suppliers
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{supplier.name}</h1>
          <Badge variant={supplier.is_active ? 'accent' : 'default'}>
            {supplier.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Supplier Details */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            {supplier.contact_name && (
              <div>
                <dt className="text-steel-500">Contact Name</dt>
                <dd className="text-white mt-1">{supplier.contact_name}</dd>
              </div>
            )}
            {supplier.contact_email && (
              <div>
                <dt className="text-steel-500">Email</dt>
                <dd className="text-white mt-1">{supplier.contact_email}</dd>
              </div>
            )}
            {supplier.contact_phone && (
              <div>
                <dt className="text-steel-500">Phone</dt>
                <dd className="text-white mt-1">{supplier.contact_phone}</dd>
              </div>
            )}
            {supplier.address && (
              <div>
                <dt className="text-steel-500">Address</dt>
                <dd className="text-steel-300 mt-1 whitespace-pre-line">{supplier.address}</dd>
              </div>
            )}
            {supplier.notes && (
              <div className="sm:col-span-2">
                <dt className="text-steel-500">Notes</dt>
                <dd className="text-steel-300 mt-1 whitespace-pre-line">{supplier.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">Name</th>
                  <th className="pb-3 text-left font-medium text-steel-500">SKU</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Category</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Tier 1</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Tier 2</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Tier 3</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Tier 4</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product) => (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-accent-purple hover:text-accent-purple-light font-medium"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-steel-400">{product.sku}</td>
                    <td className="py-3 text-steel-300">{product.category}</td>
                    <td className="py-3 text-right text-steel-300">
                      {product.prices[0] != null ? formatCurrency(product.prices[0]) : '—'}
                    </td>
                    <td className="py-3 text-right text-steel-300">
                      {product.prices[1] != null ? formatCurrency(product.prices[1]) : '—'}
                    </td>
                    <td className="py-3 text-right text-steel-300">
                      {product.prices[2] != null ? formatCurrency(product.prices[2]) : '—'}
                    </td>
                    <td className="py-3 text-right text-steel-300">
                      {product.prices[3] != null ? formatCurrency(product.prices[3]) : '—'}
                    </td>
                    <td className="py-3">
                      <Badge variant={product.is_active ? 'accent' : 'default'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-steel-500">
                      No products linked to this supplier
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
