'use client'

import { useRouter } from 'next/navigation'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'

interface PayInvoiceClientProps {
  orderId: string
  orderNumber: string
  total: number
}

export function PayInvoiceClient({
  orderId,
  orderNumber,
  total,
}: PayInvoiceClientProps) {
  const router = useRouter()

  return (
    <StripePaymentForm
      orderId={orderId}
      orderNumber={orderNumber}
      total={total}
      onSuccess={() => router.push(`/orders/${orderId}`)}
      onCancel={() => router.back()}
    />
  )
}
