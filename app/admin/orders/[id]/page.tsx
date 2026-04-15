import Link from 'next/link'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { PAYMENT_STATUS_LABELS, MFG_STATUS_LABELS, INVOICE_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderAdminActions } from '@/components/admin/order-admin-actions'
import type { OrderStatus, PaymentStatus } from '@/lib/types/database'
import { notFound } from 'next/navigation'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const [{ data: order }, { data: items }, { data: invoices }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, clinics(id, name, tier, primary_contact_name, primary_email)')
      .eq('id', id)
      .single(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('invoices')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!order) notFound()

  const clinic = order.clinics as unknown as {
    id: string
    name: string
    tier: string
    primary_contact_name: string
    primary_email: string
  } | null

  const totalRevenue = items?.reduce((sum, i) => sum + i.line_total, 0) ?? 0
  const totalCost = items?.reduce((sum, i) => sum + i.line_cost, 0) ?? 0
  const margin = totalRevenue - totalCost
  const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{order.order_number}</h1>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="pb-3 text-left font-medium text-steel-500">SKU</th>
                      <th className="pb-3 text-left font-medium text-steel-500">Name</th>
                      <th className="pb-3 text-right font-medium text-steel-500">Qty</th>
                      <th className="pb-3 text-right font-medium text-steel-500">Unit Price</th>
                      <th className="pb-3 text-right font-medium text-steel-500">Unit Cost</th>
                      <th className="pb-3 text-left font-medium text-steel-500">Tier</th>
                      <th className="pb-3 text-right font-medium text-steel-500">Line Total</th>
                      <th className="pb-3 text-right font-medium text-steel-500">Line Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items?.map((item) => {
                      const snapshot = item.bundle_snapshot as {
                        components?: Array<{ sku: string; name: string; quantity: number }>
                      } | null
                      const isBundle = item.bundle_id != null
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 align-top"
                        >
                          <td className="py-3 font-mono text-steel-400">{item.sku}</td>
                          <td className="py-3 text-white">
                            <div className="flex items-center gap-2">
                              {item.product_name}
                              {isBundle && (
                                <span className="rounded-full bg-accent-blue/15 px-2 py-0.5 text-[10px] font-semibold text-accent-blue">
                                  Bundle
                                </span>
                              )}
                            </div>
                            {isBundle && snapshot?.components && (
                              <ul className="mt-1 ml-3 space-y-0.5 text-xs text-steel-500">
                                {snapshot.components.map((c, i) => (
                                  <li key={i}>
                                    {c.quantity}× {c.name}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                          <td className="py-3 text-right text-steel-300">{item.quantity}</td>
                          <td className="py-3 text-right text-steel-300">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-3 text-right text-steel-400">
                            {formatCurrency(item.unit_cost)}
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">{item.tier_applied}</Badge>
                          </td>
                          <td className="py-3 text-right text-white font-medium">
                            {formatCurrency(item.line_total)}
                          </td>
                          <td className="py-3 text-right text-steel-400">
                            {formatCurrency(item.line_cost)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-steel-500">Revenue</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-steel-500">Cost</p>
                  <p className="text-lg font-bold text-steel-300">{formatCurrency(totalCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-steel-500">Margin</p>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(margin)}</p>
                </div>
                <div>
                  <p className="text-xs text-steel-500">Margin %</p>
                  <p className="text-lg font-bold text-emerald-400">{marginPct.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          {invoices && invoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl bg-white/3 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-steel-400" />
                        <div>
                          <p className="text-sm font-medium text-white">
                            {inv.invoice_number}
                          </p>
                          <p className="text-xs text-steel-500 capitalize">
                            {inv.invoice_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                        </Badge>
                        <p className="text-sm font-medium text-white tabular-nums">
                          {formatCurrency(inv.total)}
                        </p>
                        <Link
                          href={`/invoices/${inv.id}/print`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-steel-300 transition-colors hover:border-accent-purple/40 hover:text-white"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          PDF
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admin Actions */}
          <OrderAdminActions
            orderId={order.id}
            orderNumber={order.order_number}
            status={order.status as OrderStatus}
            paymentStatus={order.payment_status as PaymentStatus}
            trackingNumber={order.tracking_number}
          />

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-steel-500">Subtotal</dt>
                  <dd className="text-white">{formatCurrency(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-steel-500">Shipping</dt>
                  <dd className="text-white">{formatCurrency(order.shipping_cost)}</dd>
                </div>
                <div className="flex justify-between border-t border-white/8 pt-3">
                  <dt className="text-white font-medium">Total</dt>
                  <dd className="text-white font-bold">{formatCurrency(order.total)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-steel-500">Method</dt>
                  <dd className="text-white capitalize">{order.payment_method ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-steel-500">Status</dt>
                  <dd className="text-white">
                    {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                  </dd>
                </div>
                {order.wire_reference && (
                  <div className="flex justify-between">
                    <dt className="text-steel-500">Wire Ref</dt>
                    <dd className="text-white font-mono text-xs">{order.wire_reference}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-steel-500">Mfg Status</dt>
                  <dd className="text-white">
                    {MFG_STATUS_LABELS[order.mfg_status] ?? order.mfg_status}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Clinic Info */}
          {clinic && (
            <Card>
              <CardHeader>
                <CardTitle>Clinic</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-steel-500">Name</dt>
                    <dd>
                      <Link
                        href={`/admin/clinics/${clinic.id}`}
                        className="text-accent-purple hover:text-accent-purple-light"
                      >
                        {clinic.name}
                      </Link>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel-500">Tier</dt>
                    <dd>
                      <Badge variant="accent">{clinic.tier}</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-steel-500">Contact</dt>
                    <dd className="text-steel-300">{clinic.primary_contact_name}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                {order.shipping_address && (
                  <div>
                    <dt className="text-steel-500">Address</dt>
                    <dd className="text-steel-300 whitespace-pre-line">{order.shipping_address}</dd>
                  </div>
                )}
                {order.shipping_method && (
                  <div className="flex justify-between">
                    <dt className="text-steel-500">Method</dt>
                    <dd className="text-white capitalize">{order.shipping_method}</dd>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <dt className="text-steel-500">Tracking</dt>
                    <dd className="text-white font-mono text-xs">{order.tracking_number}</dd>
                  </div>
                )}
                {order.shipped_at && (
                  <div className="flex justify-between">
                    <dt className="text-steel-500">Shipped</dt>
                    <dd className="text-steel-300">{formatDateTime(order.shipped_at)}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-steel-300 whitespace-pre-line">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
