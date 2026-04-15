import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'
import { PAYMENT_STATUS_LABELS } from '@/lib/constants'
import { FileText } from 'lucide-react'
import type { PaymentStatus } from '@/lib/types/database'

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  awaiting_wire: 'bg-accent-blue/15 text-accent-blue-light',
  paid: 'bg-emerald-500/15 text-emerald-400',
  confirmed: 'bg-emerald-500/15 text-emerald-400',
  refunded: 'bg-steel-600/20 text-steel-500',
  failed: 'bg-red-500/15 text-red-400',
}

export default async function InvoicesPage() {
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
    .select(
      'id, order_number, total, payment_status, created_at, invoices!inner(id, invoice_number, invoice_type)'
    )
    .eq('clinic_id', profile.clinic_id)
    .eq('invoices.invoice_type', 'consulting')
    .order('created_at', { ascending: false })

  type Row = {
    id: string
    order_number: string
    total: number
    payment_status: string
    created_at: string
    invoices: Array<{ id: string; invoice_number: string; invoice_type: string }>
  }
  const rows = (orders ?? []) as unknown as Row[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
      </div>

      <p className="text-sm text-steel-400">
        Each order has a payment invoice for professional consulting services. Itemized
        receipts for products are available inside each order.
      </p>

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl bg-surface-card border border-white/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Payment Invoice #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Order #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((order) => {
                const consulting = order.invoices?.[0]
                if (!consulting) return null
                return (
                  <tr key={order.id} className="transition-colors hover:bg-white/5">
                    <td className="px-6 py-4">
                      <Link
                        href={`/invoices/${consulting.id}`}
                        className="text-sm font-medium text-white hover:text-accent-purple-light"
                      >
                        {consulting.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-steel-300 hover:text-white"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-steel-300">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          paymentStatusColors[order.payment_status as PaymentStatus] ??
                          'bg-white/10 text-steel-300'
                        }`}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-white">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-card border border-white/8 py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-steel-600" />
          <p className="mt-4 text-steel-400">No invoices yet</p>
        </div>
      )}
    </div>
  )
}
