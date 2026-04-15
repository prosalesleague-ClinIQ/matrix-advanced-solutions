import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/order-status-badge'
import { OrderStatusStepper } from '@/components/orders/order-status-stepper'
import { formatCurrency, formatDate } from '@/lib/format'
import { PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { ArrowLeft, FileText, Printer, CreditCard } from 'lucide-react'
import type { OrderStatus, PaymentStatus } from '@/lib/types/database'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
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

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('clinic_id', profile.clinic_id)
    .single()

  if (!order) notFound()

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_type, status, total, created_at')
    .eq('order_id', order.id)

  return (
    <div className="space-y-6">
      {/* Back link + heading */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm text-steel-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="mt-4 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">{order.order_number}</h1>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      {/* Status stepper */}
      <OrderStatusStepper currentStatus={order.status as OrderStatus} />

      {/* Main content: 2-column grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Items table (spans 2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                        SKU
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                        Name
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                        Qty
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                        Unit Price
                      </th>
                      <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                        Tier
                      </th>
                      <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                        Line Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orderItems?.map((item) => {
                      const snapshot = item.bundle_snapshot as {
                        components?: Array<{ sku: string; name: string; quantity: number }>
                      } | null
                      const isBundle = item.bundle_id != null
                      return (
                        <tr key={item.id}>
                          <td className="py-3 text-sm font-mono text-steel-400 align-top">
                            {item.sku}
                          </td>
                          <td className="py-3 text-sm text-white align-top">
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
                          <td className="py-3 text-right text-sm text-steel-300 align-top">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-right text-sm text-steel-300 align-top">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="py-3 text-sm text-steel-400 align-top">
                            {item.tier_applied}
                          </td>
                          <td className="py-3 text-right text-sm font-medium text-white align-top">
                            {formatCurrency(item.line_total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment Invoice (consulting) */}
          {(() => {
            const consulting = invoices?.find((i) => i.invoice_type === 'consulting')
            const product = invoices?.find((i) => i.invoice_type === 'product')
            return (
              <>
                {consulting && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Invoice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-steel-400">
                        This is the invoice you pay. It covers professional consulting
                        services for this order.
                      </p>
                      <div className="flex items-center justify-between rounded-xl bg-white/3 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-accent-purple" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {consulting.invoice_number}
                            </p>
                            <p className="text-xs text-steel-400">
                              {formatDate(consulting.created_at)} &middot;{' '}
                              {formatCurrency(consulting.total)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/invoices/${consulting.id}`}
                            className="rounded-lg bg-accent-purple px-4 py-2 text-xs font-semibold text-white hover:bg-accent-purple-light"
                          >
                            View &amp; Pay
                          </Link>
                          <Link
                            href={`/invoices/${consulting.id}/print`}
                            target="_blank"
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-steel-300 hover:text-white"
                          >
                            PDF
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {product && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Itemized Receipt</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-steel-400">
                        Itemized record of products shipped with this order. For your
                        records only — not a separate bill.
                      </p>
                      <div className="flex items-center justify-between rounded-xl bg-white/3 p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-steel-500" />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {product.invoice_number}
                            </p>
                            <p className="text-xs text-steel-400">
                              {formatDate(product.created_at)} &middot;{' '}
                              {formatCurrency(product.total)}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/invoices/${product.id}/print`}
                          target="_blank"
                          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-steel-300 hover:text-white"
                        >
                          Download PDF
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )
          })()}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-steel-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel-400">Shipping</span>
                  <span className="text-white">
                    {formatCurrency(order.shipping_cost)}
                  </span>
                </div>
                <div className="border-t border-white/8 pt-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-white">Total</span>
                    <span className="gradient-text-accent text-lg">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-steel-400">Method</span>
                  <span className="text-white capitalize">
                    {order.payment_method ?? 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-steel-400">Status</span>
                  <span className="text-white">
                    {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                      order.payment_status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.shipping_address && (
                  <div>
                    <p className="text-xs text-steel-500 mb-1">Address</p>
                    <p className="text-sm text-steel-300 whitespace-pre-line">
                      {order.shipping_address}
                    </p>
                  </div>
                )}
                {order.shipping_method && (
                  <div className="flex justify-between text-sm">
                    <span className="text-steel-400">Method</span>
                    <span className="text-white capitalize">
                      {order.shipping_method}
                    </span>
                  </div>
                )}
                {order.tracking_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-steel-400">Tracking</span>
                    <span className="text-white font-mono text-xs">
                      {order.tracking_number}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-steel-300 whitespace-pre-line">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
