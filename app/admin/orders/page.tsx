import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/format'
import { PAYMENT_STATUS_LABELS, MFG_STATUS_LABELS } from '@/lib/constants'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/lib/types/database'

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, mfg_status, total, created_at, clinics(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <Link href="/admin/orders/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Place Order for Clinic
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl bg-surface-card border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left font-medium text-steel-500">Order #</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Clinic</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Date</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Status</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Payment</th>
                <th className="px-6 py-4 text-left font-medium text-steel-500">Mfg</th>
                <th className="px-6 py-4 text-right font-medium text-steel-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => {
                const clinic = order.clinics as unknown as { name: string } | null
                return (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-accent-purple hover:text-accent-purple-light font-medium"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-steel-300">{clinic?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-steel-400">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status as OrderStatus} />
                    </td>
                    <td className="px-6 py-4 text-steel-300">
                      {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                    </td>
                    <td className="px-6 py-4 text-steel-300">
                      {MFG_STATUS_LABELS[order.mfg_status] ?? order.mfg_status}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                )
              })}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-steel-500">
                    No orders found
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
