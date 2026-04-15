/**
 * Invoice print view — /invoices/[id]/print
 *
 * A server-rendered, printable invoice page. Accessible to:
 *   • the clinic that owns the invoice (via RLS on invoices + clinics)
 *   • any matrix_admin / matrix_staff user (via RLS admin override)
 *
 * The page is styled for both screen preview and physical print output
 * via an embedded `@media print` stylesheet. The user clicks "Download
 * PDF" which calls `window.print()` — the browser's native print-to-PDF
 * flow handles the actual PDF generation, which works identically on
 * every OS/browser and requires zero server-side PDF library.
 */

import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Metadata } from 'next'
import { PrintControls } from './print-controls'

export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false },
}

interface LineItem {
  sku: string
  name: string
  quantity: number
  unit_price: number
  total: number
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Auth check — must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/invoices/${id}/print`)
  }

  // RLS takes care of the access check — a clinic user can only see
  // their own clinic's invoices, and admins see everything.
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clinics(*), orders(*)')
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const clinic = invoice.clinics as unknown as {
    id: string
    name: string
    primary_contact_name: string
    primary_email: string
    primary_phone: string | null
    business_address: string | null
    shipping_address: string | null
    tax_id: string | null
  } | null

  const order = invoice.orders as unknown as {
    id: string
    order_number: string
    shipping_address: string | null
    payment_method: string | null
    created_at: string
  } | null

  const lineItems = (invoice.line_items ?? []) as unknown as LineItem[]
  const isConsulting = invoice.invoice_type === 'consulting'
  const invoiceTypeLabel = isConsulting ? 'Consulting Invoice' : 'Product Invoice'

  return (
    <>
      {/* Print-specific styles — hide controls when printing, tighten margins */}
      <style>{`
        :root {
          color-scheme: light;
        }
        html, body {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        @media print {
          .print-hide { display: none !important; }
          body { margin: 0; padding: 0; }
          .invoice-page { padding: 0.6in !important; box-shadow: none !important; }
          @page {
            size: letter;
            margin: 0.5in;
          }
        }
        @media screen {
          body {
            background: #f4f4f7 !important;
            padding: 2rem 1rem;
          }
          .invoice-page {
            max-width: 8.5in;
            min-height: 11in;
            margin: 0 auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
            border-radius: 6px;
          }
        }
      `}</style>

      <PrintControls />

      <div className="invoice-page bg-white p-12">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Matrix Advanced Solutions
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Professional clinic growth infrastructure
            </p>
            <p className="mt-3 text-xs text-gray-600">
              matrixadvancedsolutions.com
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {invoiceTypeLabel}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900 font-mono">
              {invoice.invoice_number}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(invoice.created_at)}
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
              Status: {invoice.status}
            </div>
          </div>
        </header>

        {/* Bill to + Order info */}
        <section className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Bill To
            </h2>
            {clinic ? (
              <div className="text-sm text-gray-800 leading-snug">
                <p className="font-semibold text-gray-900">{clinic.name}</p>
                <p>{clinic.primary_contact_name}</p>
                <p className="text-gray-600">{clinic.primary_email}</p>
                {clinic.primary_phone && (
                  <p className="text-gray-600">{clinic.primary_phone}</p>
                )}
                {clinic.business_address && (
                  <p className="mt-2 whitespace-pre-line text-gray-600 text-xs">
                    {clinic.business_address}
                  </p>
                )}
                {clinic.tax_id && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tax ID: <span className="font-mono">{clinic.tax_id}</span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Order Details
            </h2>
            <dl className="text-sm text-gray-800 space-y-1">
              {order && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Order Number</dt>
                    <dd className="font-mono font-medium">{order.order_number}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Order Date</dt>
                    <dd>{formatDate(order.created_at)}</dd>
                  </div>
                  {order.payment_method && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Payment Method</dt>
                      <dd className="capitalize">{order.payment_method}</dd>
                    </div>
                  )}
                </>
              )}
              {invoice.due_date && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Due Date</dt>
                  <dd>{formatDate(invoice.due_date)}</dd>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Paid On</dt>
                  <dd>{formatDate(invoice.paid_at)}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        {/* Line items */}
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            {isConsulting ? 'Services' : 'Products'}
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-gray-900">
                {!isConsulting && (
                  <th className="py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 w-24">
                    SKU
                  </th>
                )}
                <th className="py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  Description
                </th>
                <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 w-16">
                  Qty
                </th>
                <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 w-28">
                  Unit Price
                </th>
                <th className="py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={`${item.sku}-${i}`} className="border-b border-gray-200">
                  {!isConsulting && (
                    <td className="py-3 font-mono text-xs text-gray-600">
                      {item.sku}
                    </td>
                  )}
                  <td className="py-3 text-gray-800">{item.name}</td>
                  <td className="py-3 text-right text-gray-800 tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-800 tabular-nums">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
              {lineItems.length === 0 && (
                <tr>
                  <td
                    colSpan={isConsulting ? 4 : 5}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <section className="mt-6 flex justify-end">
          <dl className="w-72 text-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-600">Subtotal</dt>
              <dd className="text-gray-900 tabular-nums">
                {formatCurrency(invoice.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between py-1.5">
              <dt className="text-gray-600">Tax</dt>
              <dd className="text-gray-900 tabular-nums">
                {formatCurrency(invoice.tax)}
              </dd>
            </div>
            <div className="flex justify-between border-t-2 border-gray-900 pt-2 mt-2">
              <dt className="text-base font-bold text-gray-900">Total Due</dt>
              <dd className="text-base font-bold text-gray-900 tabular-nums">
                {formatCurrency(invoice.total)}
              </dd>
            </div>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 text-[11px] text-gray-500 leading-relaxed">
          <p>
            Professional use only. For qualified clinics and providers. This
            invoice is part of a paired billing with its counterpart (
            {isConsulting ? 'product invoice' : 'consulting invoice'}
            ) — the total due reflects the single payment owed for this order.
          </p>
          <p className="mt-2">
            Questions? Contact billing@matrixadvancedsolutions.com
          </p>
          <p className="mt-4 text-center text-gray-400">
            Matrix Advanced Solutions · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </>
  )
}
