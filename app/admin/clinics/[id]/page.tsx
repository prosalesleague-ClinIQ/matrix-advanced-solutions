import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/format'
import { ONBOARDING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import type { OrderStatus } from '@/lib/types/database'
import { notFound } from 'next/navigation'

export default async function AdminClinicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: clinic }, { data: orders }, { data: users }] = await Promise.all([
    supabase.from('clinics').select('*').eq('id', id).single(),
    supabase
      .from('orders')
      .select('id, order_number, status, payment_status, total, created_at')
      .eq('clinic_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('users')
      .select('id, full_name, email, role, is_active, last_login')
      .eq('clinic_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!clinic) notFound()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/clinics"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clinics
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-white">{clinic.name}</h1>
          <Badge variant="accent">{clinic.tier}</Badge>
          <Badge variant="outline">
            {ONBOARDING_STATUS_LABELS[clinic.onboarding_status] ?? clinic.onboarding_status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-steel-500">Contact Name</dt>
                <dd className="text-white">{clinic.primary_contact_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500">Email</dt>
                <dd className="text-white">{clinic.primary_email}</dd>
              </div>
              {clinic.primary_phone && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Phone</dt>
                  <dd className="text-white">{clinic.primary_phone}</dd>
                </div>
              )}
              {clinic.business_address && (
                <div>
                  <dt className="text-steel-500 mb-1">Business Address</dt>
                  <dd className="text-steel-300 whitespace-pre-line">{clinic.business_address}</dd>
                </div>
              )}
              {clinic.shipping_address && (
                <div>
                  <dt className="text-steel-500 mb-1">Shipping Address</dt>
                  <dd className="text-steel-300 whitespace-pre-line">{clinic.shipping_address}</dd>
                </div>
              )}
              {clinic.tax_id && (
                <div className="flex justify-between">
                  <dt className="text-steel-500">Tax ID</dt>
                  <dd className="text-white font-mono">{clinic.tax_id}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Payment Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-steel-500">Wire Verified</dt>
                <dd>
                  {clinic.wire_verified ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-steel-600" />
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-steel-500">Card Enabled</dt>
                <dd>
                  {clinic.card_enabled ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-steel-600" />
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-steel-500">ACH Enabled</dt>
                <dd>
                  {clinic.ach_enabled ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-steel-600" />
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Users */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">Name</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Email</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Role</th>
                  <th className="pb-3 text-center font-medium text-steel-500">Active</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="py-3 text-white">{user.full_name}</td>
                    <td className="py-3 text-steel-300">{user.email}</td>
                    <td className="py-3">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="py-3 text-center">
                      {user.is_active ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-400" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-steel-600" />
                      )}
                    </td>
                    <td className="py-3 text-steel-400">
                      {user.last_login ? formatRelativeTime(user.last_login) : 'Never'}
                    </td>
                  </tr>
                ))}
                {(!users || users.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="pb-3 text-left font-medium text-steel-500">Order #</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Date</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Status</th>
                  <th className="pb-3 text-left font-medium text-steel-500">Payment</th>
                  <th className="pb-3 text-right font-medium text-steel-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-accent-purple hover:text-accent-purple-light"
                      >
                        {order.order_number}
                      </Link>
                    </td>
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
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-steel-500">
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
