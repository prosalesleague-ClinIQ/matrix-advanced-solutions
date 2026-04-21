'use client'

import { useEffect, useState } from 'react'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react'
import { getStripeClient } from '@/lib/stripe-client'

interface StripePaymentFormProps {
  orderId: string
  orderNumber: string
  total: number
  onSuccess: () => void
  onCancel: () => void
  returnUrl?: string
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentError, setIntentError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function createIntent() {
      try {
        const res = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: props.orderId }),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }
        if (!cancelled) setClientSecret(data.clientSecret)
      } catch (err) {
        if (!cancelled) {
          setIntentError(
            err instanceof Error ? err.message : 'Failed to initialize payment'
          )
        }
      }
    }
    createIntent()
    return () => {
      cancelled = true
    }
  }, [props.orderId])

  if (intentError) {
    return (
      <Card variant="glass" className="p-6">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{intentError}</p>
        </div>
        <div className="mt-4">
          <Button variant="ghost" size="md" onClick={props.onCancel}>
            Back
          </Button>
        </div>
      </Card>
    )
  }

  if (!clientSecret) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent-purple" />
        </div>
      </Card>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#a855f7',
        colorBackground: '#0b1020',
        colorText: '#ffffff',
        colorDanger: '#f87171',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  }

  return (
    <Elements stripe={getStripeClient()} options={options}>
      <InnerPaymentForm {...props} />
    </Elements>
  )
}

function InnerPaymentForm({
  orderNumber,
  total,
  onSuccess,
  onCancel,
  returnUrl,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const confirmReturnUrl =
      returnUrl ??
      (typeof window !== 'undefined'
        ? `${window.location.origin}/orders`
        : '/orders')

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: confirmReturnUrl,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed')
      setIsProcessing(false)
      return
    }

    if (paymentIntent) {
      if (
        paymentIntent.status === 'succeeded' ||
        paymentIntent.status === 'processing'
      ) {
        onSuccess()
        return
      }
      setError(`Unexpected payment status: ${paymentIntent.status}`)
    }

    setIsProcessing(false)
  }

  return (
    <Card variant="glass" className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15">
          <CreditCard className="h-5 w-5 text-accent-purple" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Pay Online</h3>
          <p className="text-xs text-steel-400">Order {orderNumber}</p>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="mb-1 text-sm text-steel-400">Amount Due</p>
        <p className="text-2xl font-semibold text-white">
          {formatCurrency(total)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['us_bank_account', 'card'],
          }}
        />

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-steel-500" />
          <p className="text-xs text-steel-500">
            Secured by Stripe. Card and bank details never touch our servers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!stripe || !elements || isProcessing}
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
            type="button"
            variant="ghost"
            size="md"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
