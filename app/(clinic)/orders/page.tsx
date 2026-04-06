import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OrderStatus, PaymentStatus } from '@/lib/types/database'

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Orders</h1>
      </div>

      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl bg-surface-card border border-white/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Payment
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-medium text-white hover:text-accent-purple-light"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-steel-300">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-steel-300">
                      {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                        order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-white">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-card border border-white/8 py-16 text-center">
          <Package className="mx-auto h-12 w-12 text-steel-600" />
          <p className="mt-4 text-steel-400">No orders yet</p>
          <Link href="/catalog" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Browse Products
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
