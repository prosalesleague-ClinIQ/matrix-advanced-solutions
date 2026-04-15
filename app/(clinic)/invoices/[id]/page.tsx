import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/format'
import { INVOICE_STATUS_LABELS } from '@/lib/constants'
import { ArrowLeft, Printer, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InvoiceLineItem } from '@/lib/types/database'
import type { InvoiceStatus, InvoiceType } from '@/lib/types/database'

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-steel-600/20 text-steel-400',
  sent: 'bg-accent-blue/15 text-accent-blue-light',
  paid: 'bg-emerald-500/15 text-emerald-400',
  unpaid: 'bg-yellow-500/15 text-yellow-400',
  overdue: 'bg-red-500/15 text-red-400',
  void: 'bg-steel-600/20 text-steel-500',
}

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
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

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('clinic_id', profile.clinic_id)
    .single()

  if (!invoice) notFound()

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('id', invoice.order_id)
    .single()

  const isProduct = (invoice.invoice_type as InvoiceType) === 'product'
  let consultingSibling: { id: string; invoice_number: string } | null = null
  if (isProduct && invoice.order_id) {
    const { data: sib } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('order_id', invoice.order_id)
      .eq('invoice_type', 'consulting')
      .maybeSingle()
    consultingSibling = sib
  }

  const lineItems = (invoice.line_items ?? []) as unknown as InvoiceLineItem[]

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm text-steel-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      {isProduct && consultingSibling && (
        <div className="flex items-start gap-3 rounded-xl border border-accent-blue/30 bg-accent-blue/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-blue-light" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-white">This is an itemized receipt, not a bill.</p>
            <p className="mt-1 text-steel-300">
              Your payment invoice for this order is{' '}
              <Link
                href={`/invoices/${consultingSibling.id}`}
                className="font-medium text-accent-blue-light underline hover:text-white"
              >
                {consultingSibling.invoice_number}
              </Link>
              . Use that invoice to submit payment.
            </p>
          </div>
        </div>
      )}

      {/* Heading */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold text-white">{invoice.invoice_number}</h1>
        <Badge
          variant={
            (invoice.invoice_type as InvoiceType) === 'consulting' ? 'accent' : 'default'
          }
        >
          {(invoice.invoice_type as InvoiceType) === 'consulting' ? 'Consulting' : 'Product'}
        </Badge>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            invoiceStatusColors[invoice.status as InvoiceStatus] ??
            'bg-white/10 text-steel-300'
          }`}
        >
          {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
        </span>
        <div className="ml-auto">
          <Link href={`/invoices/${invoice.id}/print`} target="_blank">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" />
              Download PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Line items table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
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
                  <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-sm font-mono text-steel-400">
                      {item.sku}
                    </td>
                    <td className="py-3 text-sm text-white">{item.name}</td>
                    <td className="py-3 text-right text-sm text-steel-300">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-sm text-steel-300">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-3 text-right text-sm font-medium text-white">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="ml-auto max-w-xs space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-steel-400">Subtotal</span>
              <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-steel-400">Tax</span>
              <span className="text-white">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t border-white/8 pt-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-white">Total</span>
                <span className="gradient-text-accent text-lg">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related order link */}
      {order && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-steel-400">Related Order</span>
              <Link
                href={`/orders/${order.id}`}
                className="text-sm font-medium text-accent-purple-light hover:text-accent-purple transition-colors"
              >
                {order.order_number}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
