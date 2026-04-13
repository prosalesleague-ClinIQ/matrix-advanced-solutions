import Link from 'next/link'
import Image from 'next/image'
import { Plus, PackageOpen, Star } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AdminBundlesPage() {
  const supabase = await createServerSupabaseClient()

  const { data: bundles } = await supabase
    .from('product_bundles')
    .select('*, items:product_bundle_items(count)')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Bundles</h1>
        <Link href="/admin/bundles/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Bundle
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Image</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Name</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">SKU</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Items</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 1</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 2</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 3</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Tier 4</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {bundles?.map((bundle) => {
                const itemCount = Array.isArray(bundle.items) && bundle.items[0]
                  ? (bundle.items[0] as { count: number }).count
                  : 0
                return (
                  <tr
                    key={bundle.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {bundle.image_url ? (
                        <Image
                          src={bundle.image_url}
                          alt={bundle.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                          <PackageOpen className="h-5 w-5 text-steel-500" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/bundles/${bundle.id}`}
                        className="text-accent-purple hover:text-accent-purple-light font-medium inline-flex items-center gap-2"
                      >
                        {bundle.name}
                        {bundle.is_featured && (
                          <Star className="h-3.5 w-3.5 fill-accent-purple text-accent-purple" />
                        )}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-steel-400">{bundle.sku}</td>
                    <td className="px-6 py-4">
                      <Badge>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300 tabular-nums">
                      {bundle.prices[0] != null ? formatCurrency(bundle.prices[0]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300 tabular-nums">
                      {bundle.prices[1] != null ? formatCurrency(bundle.prices[1]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300 tabular-nums">
                      {bundle.prices[2] != null ? formatCurrency(bundle.prices[2]) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-steel-300 tabular-nums">
                      {bundle.prices[3] != null ? formatCurrency(bundle.prices[3]) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={bundle.is_active ? 'accent' : 'default'}>
                        {bundle.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
              {(!bundles || bundles.length === 0) && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-steel-500">
                    No bundles yet. Create your first one.
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
