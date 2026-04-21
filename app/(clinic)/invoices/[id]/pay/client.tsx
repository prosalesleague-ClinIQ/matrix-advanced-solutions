'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import { WireInstructions } from '@/components/checkout/wire-instructions'
import { Card } from '@/components/ui/card'
import { Building2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PayInvoiceClientProps {
  orderId: string
  orderNumber: string
  invoiceNumber: string
  total: number
}

type PayMode = 'online' | 'wire'

export function PayInvoiceClient({
  orderId,
  orderNumber,
  invoiceNumber,
  total,
}: PayInvoiceClientProps) {
  const router = useRouter()
  const [mode, setMode] = useState<PayMode>('online')

  return (
    <div className="space-y-6">
      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('online')}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
            mode === 'online'
              ? 'border-accent-purple bg-accent-purple/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          )}
        >
          <CreditCard className="h-5 w-5 text-accent-purple" />
          <div>
            <p className="text-sm font-medium text-white">Pay Online</p>
            <p className="text-xs text-steel-400">Card or ACH</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('wire')}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
            mode === 'wire'
              ? 'border-accent-purple bg-accent-purple/10'
              : 'border-white/10 bg-white/5 hover:border-white/20'
          )}
        >
          <Building2 className="h-5 w-5 text-accent-purple" />
          <div>
            <p className="text-sm font-medium text-white">Wire or Zelle</p>
            <p className="text-xs text-steel-400">Manual bank transfer</p>
          </div>
        </button>
      </div>

      {/* Method content */}
      {mode === 'online' ? (
        <StripePaymentForm
          orderId={orderId}
          orderNumber={orderNumber}
          total={total}
          onSuccess={() => router.push(`/orders/${orderId}`)}
          onCancel={() => router.back()}
        />
      ) : (
        <>
          <WireInstructions orderNumber={invoiceNumber} />
          <Card variant="glass" className="p-4">
            <p className="text-sm text-steel-400">
              Your order will be processed once payment is confirmed. Include the
              payment invoice number as the memo. An admin will confirm the order
              manually once funds arrive.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
