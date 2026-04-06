import { Plus } from 'lucide-react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminSuppliersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name, contact_name, contact_email, contact_phone, is_active')
    .order('name', { ascending: true })

  // Get product counts per supplier
  const { data: productCounts } = await supabase
    .from('products')
    .select('supplier_id')

  const countMap: Record<string, number> = {}
  productCounts?.forEach((p) => {
    if (p.supplier_id) {
      countMap[p.supplier_id] = (countMap[p.supplier_id] ?? 0) + 1
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Suppliers</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Supplier
        </Button>
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Contact</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Email</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Phone</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Products</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers?.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/suppliers/${supplier.id}`}
                      className="text-accent-purple hover:text-accent-purple-light font-medium"
                    >
                      {supplier.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-steel-300">{supplier.contact_name ?? '—'}</td>
                  <td className="px-6 py-4 text-steel-300">{supplier.contact_email ?? '—'}</td>
                  <td className="px-6 py-4 text-steel-300">{supplier.contact_phone ?? '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="accent">{countMap[supplier.id] ?? 0}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={supplier.is_active ? 'accent' : 'default'}>
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!suppliers || suppliers.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel-500">
                    No suppliers found
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
