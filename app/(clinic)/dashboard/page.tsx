import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { CLINIC_TIERS } from '@/lib/constants'
import { ShoppingBag, ClipboardList, Settings, Package } from 'lucide-react'
import type { OrderStatus } from '@/lib/types/database'

export default async function DashboardPage() {
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

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', profile.clinic_id)
    .single()

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', profile.clinic_id)

  const { data: spendData } = await supabase
    .from('orders')
    .select('total')
    .eq('clinic_id', profile.clinic_id)
    .eq('payment_status', 'paid')

  const totalSpend = spendData?.reduce((sum, o) => sum + o.total, 0) ?? 0
  const tierLabel = clinic ? CLINIC_TIERS[clinic.tier]?.label ?? clinic.tier : 'Unknown'

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {profile.full_name}
        </h1>
        {clinic && (
          <p className="mt-1 text-steel-400">{clinic.name}</p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-steel-400">
              Clinic Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="accent" className="text-sm">
              {tierLabel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-steel-400">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold gradient-text-accent">
              {totalOrders ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-steel-400">
              Total Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold gradient-text-accent">
              {formatCurrency(totalSpend)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalog">
              <Button variant="primary" size="md">
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="secondary" size="md">
                <ClipboardList className="h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="secondary" size="md">
                <Settings className="h-4 w-4" />
                Clinic Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-4">
                    <Package className="h-5 w-5 text-steel-500" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-steel-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status as OrderStatus} />
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-steel-400">No orders yet</p>
              <Link href="/catalog" className="mt-4 inline-block">
                <Button variant="primary" size="sm">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
