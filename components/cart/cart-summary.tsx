'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'

interface CartSummaryProps {
  itemCount: number
  subtotal: number
  shippingCost: number
  total: number
  shippingLabel: string
  onCheckout: () => void
}

export function CartSummary({
  itemCount,
  subtotal,
  shippingCost,
  total,
  shippingLabel,
  onCheckout,
}: CartSummaryProps) {
  return (
    <Card className="bg-surface-card border-white/10">
      <h2 className="mb-4 text-lg font-semibold text-white">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-steel-400">
          <span>Items ({itemCount})</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-steel-400">
          <span>{shippingLabel}</span>
          <span className="text-white">{formatCurrency(shippingCost)}</span>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-white">Total</span>
            <span className="text-base font-bold text-white">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="mt-6 w-full"
        onClick={onCheckout}
        disabled={itemCount === 0}
      >
        Proceed to Checkout
      </Button>

      <p className="mt-3 text-center text-xs text-steel-500">
        Subject to credentialing and approval.
      </p>
    </Card>
  )
}
