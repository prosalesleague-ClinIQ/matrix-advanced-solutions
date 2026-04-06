import Link from 'next/link'
import {
  ShoppingCart,
  DollarSign,
  Clock,
  Package,
  Building2,
} from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/format'
import { PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import type { OrderStatus } from '@/lib/types/database'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: ordersToday },
    { data: revenueData },
    { count: pendingWires },
    { count: pendingBatch },
    { count: totalClinics },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59.999`),
    supabase
      .from('orders')
      .select('total')
      .in('payment_status', ['paid', 'confirmed']),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'awaiting_wire'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('mfg_status', 'pending')
      .in('payment_status', ['paid', 'confirmed']),
    supabase
      .from('clinics')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, created_at, clinics(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  const kpis = [
    { label: 'Orders Today', value: String(ordersToday ?? 0), icon: ShoppingCart },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign },
    { label: 'Pending Wires', value: String(pendingWires ?? 0), icon: Clock },
    { label: 'Ready to Batch', value: String(pendingBatch ?? 0), icon: Package },
    { label: 'Active Clinics', value: String(totalClinics ?? 0), icon: Building2 },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/5 p-2">
                  <kpi.icon className="h-5 w-5 text-steel-400" />
                </div>
                <div>
                  <p className="text-xs text-steel-500">{kpi.label}</p>
                  <p className="text-xl font-bold gradient-text-accent">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-sm text-accent-purple hover:text-accent-purple-light transition-colors"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">Order #</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Clinic</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Date</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Status</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Payment</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((order) => {
                  const clinic = order.clinics as unknown as { name: string } | null
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/3 transition-colors"
                    >
                      <td className="py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-accent-purple hover:text-accent-purple-light"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-3 text-steel-300">{clinic?.name ?? '—'}</td>
                      <td className="py-3 text-steel-400">{formatDate(order.created_at)}</td>
                      <td className="py-3">
                        <OrderStatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="py-3 text-steel-300">
                        {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                      </td>
                      <td className="py-3 text-right text-white font-medium">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  )
                })}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-steel-500">
                      No orders yet
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
