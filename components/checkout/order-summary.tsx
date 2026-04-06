'use client'

import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getLineTotal } from '@/lib/pricing'
import type { CartItem } from '@/lib/types/orders'

interface OrderSummaryProps {
  items: CartItem[]
  shippingCost: number
  shippingLabel: string
  subtotal: number
  total: number
}

export function OrderSummary({
  items,
  shippingCost,
  shippingLabel,
  subtotal,
  total,
}: OrderSummaryProps) {
  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>

      {/* Line items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => {
          const lineTotal = getLineTotal(item.prices, item.quantity)
          return (
            <div
              key={item.productId}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{item.name}</p>
                <p className="text-xs text-steel-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-white whitespace-nowrap">
                {formatCurrency(lineTotal)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-steel-400">Subtotal</span>
          <span className="text-sm text-white">{formatCurrency(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-steel-400">{shippingLabel}</span>
          <span className="text-sm text-white">
            {formatCurrency(shippingCost)}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-base font-semibold text-white">Total</span>
          <span className="text-base font-semibold text-white">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </Card>
  )
}
