'use client'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { SHIPPING_METHODS, type ShippingMethod } from '@/lib/constants'

interface ShippingSelectorProps {
  selected: ShippingMethod
  onSelect: (method: ShippingMethod) => void
}

const SHIPPING_KEYS = Object.keys(SHIPPING_METHODS) as ShippingMethod[]

export function ShippingSelector({ selected, onSelect }: ShippingSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold text-white">Shipping Method</legend>
      <div className="space-y-2">
        {SHIPPING_KEYS.map((key) => {
          const method = SHIPPING_METHODS[key]
          const isSelected = key === selected

          return (
            <label
              key={key}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200',
                isSelected
                  ? 'border-accent-purple/50 bg-accent-purple/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
                    isSelected
                      ? 'border-accent-purple'
                      : 'border-steel-500'
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-accent-purple" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-white">{method.label}</span>
                  <p className="text-xs text-steel-500">{method.description}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-white">
                {formatCurrency(method.price)}
              </span>
              <input
                type="radio"
                name="shipping-method"
                value={key}
                checked={isSelected}
                onChange={() => onSelect(key)}
                className="sr-only"
              />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
