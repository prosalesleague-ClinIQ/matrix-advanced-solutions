'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react'

interface StripePaymentFormProps {
  orderId: string
  orderNumber: string
  total: number
  onSuccess: () => void
  onCancel: () => void
}

export function StripePaymentForm({
  orderId,
  orderNumber,
  total,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create payment intent')
      }

      // Client secret received — full Stripe Elements integration will go here
      // const { clientSecret } = await res.json()

      // For now, simulate success after intent creation
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Payment processing failed'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15">
          <CreditCard className="h-5 w-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Card Payment</h3>
          <p className="text-xs text-steel-400">
            Order {orderNumber}
          </p>
        </div>
      </div>

      {/* Amount display */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-5">
        <p className="text-sm text-steel-400 mb-1">Amount Due</p>
        <p className="text-2xl font-semibold text-white">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Placeholder for Stripe Elements */}
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 mb-5 text-center">
        <CreditCard className="h-8 w-8 text-steel-500 mx-auto mb-2" />
        <p className="text-sm text-steel-400">
          Stripe Elements card form will be integrated here.
        </p>
        <p className="text-xs text-steel-500 mt-1">
          Card payment processing is being finalized.
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck className="h-4 w-4 text-steel-500" />
        <p className="text-xs text-steel-500">
          Payments are processed securely via Stripe. Card details never touch
          our servers.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={handlePay}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {formatCurrency(total)}</>
          )}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </Card>
  )
}
