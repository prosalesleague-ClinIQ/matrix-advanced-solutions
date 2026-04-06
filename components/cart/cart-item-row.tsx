'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { getUnitPrice, getLineTotal } from '@/lib/pricing'
import type { CartItem } from '@/lib/types/orders'

interface CartItemRowProps {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const unitPrice = getUnitPrice(item.prices, item.quantity)
  const lineTotal = getLineTotal(item.prices, item.quantity)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-surface-card p-4 transition-colors hover:border-white/15">
      {/* Product info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-white">{item.name}</h3>
        <p className="text-xs text-steel-500">{item.sku}</p>
        <p className="mt-1 text-xs text-steel-400">
          {formatCurrency(unitPrice)}/{item.unit}
        </p>
      </div>

      {/* Quantity input */}
      <div className="flex items-center">
        <label htmlFor={`cart-qty-${item.productId}`} className="sr-only">
          Quantity for {item.name}
        </label>
        <input
          id={`cart-qty-${item.productId}`}
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10)
            if (!isNaN(val) && val > 0) {
              onUpdateQuantity(item.productId, val)
            }
          }}
          className="w-16 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-1 focus:ring-offset-navy-950"
        />
      </div>

      {/* Line total */}
      <div className="w-24 text-right">
        <span className="text-sm font-semibold text-white">{formatCurrency(lineTotal)}</span>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.productId)}
        aria-label={`Remove ${item.name} from cart`}
        className="text-steel-500 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
