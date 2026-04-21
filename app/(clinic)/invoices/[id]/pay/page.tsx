import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PayInvoiceClient } from './client'

interface PayInvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function PayInvoicePage({ params }: PayInvoicePageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) redirect('/login')

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_type, status, total, order_id')
    .eq('id', id)
    .eq('clinic_id', profile.clinic_id)
    .single()

  if (!invoice) notFound()

  if (!invoice.order_id) {
    redirect(`/invoices/${invoice.id}`)
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, total, payment_status')
    .eq('id', invoice.order_id)
    .single()

  if (!order) notFound()

  const alreadyPaid =
    order.payment_status === 'paid' || order.payment_status === 'confirmed'

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Link
        href={`/invoices/${invoice.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-steel-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoice
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Pay Invoice</h1>
        <p className="mt-1 text-sm text-steel-400">
          {invoice.invoice_number} · Order {order.order_number}
        </p>
      </div>

      {alreadyPaid ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <p className="font-medium text-emerald-300">
            This order has already been paid.
          </p>
          <p className="mt-1 text-sm text-steel-300">
            No further action is needed.
          </p>
          <Link
            href={`/orders/${order.id}`}
            className="mt-4 inline-block text-sm font-medium text-emerald-300 underline hover:text-emerald-200"
          >
            View order →
          </Link>
        </div>
      ) : (
        <PayInvoiceClient
          orderId={order.id}
          orderNumber={order.order_number}
          total={order.total}
        />
      )}
    </div>
  )
}
