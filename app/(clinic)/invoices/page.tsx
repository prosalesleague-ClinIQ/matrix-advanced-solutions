import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/format'
import { INVOICE_STATUS_LABELS } from '@/lib/constants'
import { FileText } from 'lucide-react'
import type { InvoiceStatus, InvoiceType } from '@/lib/types/database'

const invoiceStatusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-steel-600/20 text-steel-400',
  sent: 'bg-accent-blue/15 text-accent-blue-light',
  paid: 'bg-emerald-500/15 text-emerald-400',
  unpaid: 'bg-yellow-500/15 text-yellow-400',
  overdue: 'bg-red-500/15 text-red-400',
  void: 'bg-steel-600/20 text-steel-500',
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

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_type, status, total, created_at')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
      </div>

      {invoices && invoices.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl bg-surface-card border border-white/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Invoice #
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-steel-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-steel-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-sm font-medium text-white hover:text-accent-purple-light"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        (invoice.invoice_type as InvoiceType) === 'consulting'
                          ? 'accent'
                          : 'default'
                      }
                    >
                      {(invoice.invoice_type as InvoiceType) === 'consulting'
                        ? 'Consulting'
                        : 'Product'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-steel-300">
                    {formatDate(invoice.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        invoiceStatusColors[invoice.status as InvoiceStatus] ??
                        'bg-white/10 text-steel-300'
                      }`}
                    >
                      {INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-white">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              ))}
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
