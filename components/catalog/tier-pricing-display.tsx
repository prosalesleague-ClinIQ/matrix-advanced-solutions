'use client'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { getTierIndex, TIER_LABELS } from '@/lib/pricing'

interface TierPricingDisplayProps {
  prices: number[]
  activeQuantity: number
}

export function TierPricingDisplay({ prices, activeQuantity }: TierPricingDisplayProps) {
  const activeTier = getTierIndex(activeQuantity)

  return (
    <div className="grid grid-cols-4 gap-1">
      {TIER_LABELS.map((label, idx) => {
        const isActive = idx === activeTier
        const price = prices[idx] ?? prices[0]

        return (
          <div
            key={label}
            className={cn(
              'flex flex-col items-center rounded-lg px-2 py-1.5 text-center transition-colors',
              isActive
                ? 'bg-accent-purple/20 text-accent-purple'
                : 'bg-white/5 text-steel-500'
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide">
              {label}
            </span>
            <span className={cn('text-xs font-semibold', isActive && 'text-white')}>
              {formatCurrency(price)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
