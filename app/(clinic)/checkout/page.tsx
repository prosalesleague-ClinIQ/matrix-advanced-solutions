'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartContext } from '@/providers/cart-provider'
import { useUser } from '@/hooks/use-user'
import { useClinic } from '@/hooks/use-clinic'
import { SHIPPING_METHODS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { OrderSummary } from '@/components/checkout/order-summary'
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector'
import { WireInstructions } from '@/components/checkout/wire-instructions'
import { StripePaymentForm } from '@/components/checkout/stripe-payment-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Loader2,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import type { OrderSubmitResponse } from '@/lib/types/orders'

type PaymentMethod = 'wire' | 'online'
type CheckoutPhase = 'form' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { profile, isLoading: userLoading } = useUser()
  const { clinic, isLoading: clinicLoading } = useClinic(profile?.clinic_id)
  const cart = useCartContext()

  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [phase, setPhase] = useState<CheckoutPhase>('form')
  const [orderResult, setOrderResult] = useState<OrderSubmitResponse | null>(
    null
  )

  const isLoading = userLoading || clinicLoading || !cart.hydrated
  const isNewClinic = clinic?.tier === 'new'
  const items = Object.values(cart.items)
  const shippingInfo = SHIPPING_METHODS[cart.shippingMethod]

  // Pre-fill shipping address from clinic
  const effectiveShippingAddress =
    shippingAddress || clinic?.shipping_address || ''

  void isNewClinic
  const effectivePaymentMethod: PaymentMethod = paymentMethod

  // ─── Loading state ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    )
  }

  // ─── Onboarding gate ─────────────────────────────────────────
  if (clinic?.onboarding_status === 'pending') {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/15">
          <AlertTriangle className="h-8 w-8 text-accent-blue" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Complete Onboarding First
        </h1>
        <p className="text-steel-400 mb-6">
          Your clinic account needs to complete the onboarding process before
          placing orders. This ensures we can verify your credentials and
          provide the best service.
        </p>
        <Link href="/onboarding">
          <Button variant="primary" size="lg">
            Start Onboarding
          </Button>
        </Link>
      </div>
    )
  }

  // ─── Empty cart state ────────────────────────────────────────
  if (items.length === 0 && phase === 'form') {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <ShoppingCart className="h-8 w-8 text-steel-500" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-steel-400 mb-6">
          Browse the catalog to add products to your order.
        </p>
        <Link href="/catalog">
          <Button variant="primary" size="md">
            Browse Catalog
          </Button>
        </Link>
      </div>
    )
  }

  // ─── Submit handler ──────────────────────────────────────────
  const handleSubmit = async () => {
    if (!effectiveShippingAddress.trim()) {
      setSubmitError('Please enter a shipping address.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/orders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingMethod: cart.shippingMethod,
          shippingAddress: effectiveShippingAddress,
          // 'online' = Stripe Payment Element (card + ACH)
          paymentMethod: effectivePaymentMethod === 'online' ? 'card' : 'wire',
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit order')
      }

      const result: OrderSubmitResponse = await res.json()
      setOrderResult(result)
      setPhase('confirmation')
      cart.clearCart()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── Confirmation phase ──────────────────────────────────────
  if (phase === 'confirmation' && orderResult) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Order Submitted
          </h1>
          <p className="text-steel-400">
            Order{' '}
            <span className="font-mono text-white">
              {orderResult.orderNumber}
            </span>{' '}
            has been placed successfully.
          </p>
          <p className="text-sm text-steel-500 mt-1">
            Total: {formatCurrency(orderResult.total)}
          </p>
        </div>

        {/* Payment-specific content */}
        {orderResult.paymentMethod === 'wire' || orderResult.paymentMethod === 'ach' ? (
          <div className="space-y-6">
            <WireInstructions
              orderNumber={
                orderResult.wireInstructions?.reference ?? orderResult.orderNumber
              }
            />
            <Card variant="glass" className="p-4">
              <p className="text-sm text-steel-400">
                {orderResult.paymentMethod === 'ach'
                  ? 'Your order will be processed once the ACH transfer clears (typically 1-3 business days). Please include the payment invoice number as the ACH reference.'
                  : 'Your order will be processed once the wire transfer is confirmed. Please include the payment invoice number as the wire reference.'}
              </p>
            </Card>
          </div>
        ) : (
          <StripePaymentForm
            orderId={orderResult.orderId}
            orderNumber={orderResult.orderNumber}
            total={orderResult.total}
            onSuccess={() => router.push('/orders')}
            onCancel={() => router.push('/orders')}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/orders">
            <Button variant="secondary" size="md">
              View Orders
            </Button>
          </Link>
          <Link href="/catalog">
            <Button variant="ghost" size="md">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Main checkout form ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl py-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
        <h1 className="text-3xl font-semibold text-white">Checkout</h1>
        <p className="text-steel-400 mt-1">
          Review your order and complete payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Form fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping address */}
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Shipping Address
            </h2>
            <Input
              id="shipping-address"
              label="Delivery Address"
              placeholder="Enter full shipping address"
              value={effectiveShippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
            />
          </Card>

          {/* Payment method */}
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Payment</h2>

            <PaymentMethodSelector
              selected={effectivePaymentMethod}
              onSelect={setPaymentMethod}
              clinicTier={isNewClinic ? 'new' : 'returning'}
            />

            {/* Bank instructions shown inline when wire selected */}
            {effectivePaymentMethod === 'wire' && (
              <div className="mt-6">
                <WireInstructions />
              </div>
            )}
          </Card>

          {/* Order notes */}
          <Card variant="glass" className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Order Notes
            </h2>
            <Textarea
              id="order-notes"
              placeholder="Special instructions, delivery preferences, etc. (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </Card>

          {/* Error display */}
          {submitError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">{submitError}</p>
            </div>
          )}

          {/* Submit button (mobile) */}
          <div className="lg:hidden">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Order'
              )}
            </Button>
            <p className="text-xs text-steel-500 text-center mt-3">
              Professional use only. Subject to credentialing and approval.
            </p>
          </div>
        </div>

        {/* Right column: Order summary sidebar */}
        <div className="space-y-4">
          <OrderSummary
            items={items}
            shippingCost={cart.shippingCost}
            shippingLabel={shippingInfo.label}
            subtotal={cart.subtotal}
            total={cart.total}
          />

          {/* Submit button (desktop) */}
          <div className="hidden lg:block">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Order'
              )}
            </Button>
            <p className="text-xs text-steel-500 text-center mt-3">
              Professional use only. Subject to credentialing and approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
