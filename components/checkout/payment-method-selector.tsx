'use client'

import { Lock, Building2, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaymentMethodOption = 'wire' | 'card'
type ClinicTier = 'new' | 'returning'

interface PaymentMethodSelectorProps {
  selected: PaymentMethodOption
  onSelect: (method: PaymentMethodOption) => void
  clinicTier: ClinicTier
}

const OPTIONS: {
  value: PaymentMethodOption
  label: string
  description: string
  icon: typeof Building2
}[] = [
  {
    value: 'wire',
    label: 'Wire Transfer',
    description:
      'Pay via bank wire transfer. Order is processed upon wire confirmation.',
    icon: Building2,
  },
  {
    value: 'card',
    label: 'Credit / Debit Card',
    description:
      'Pay instantly with a credit or debit card via Stripe.',
    icon: CreditCard,
  },
]

export function PaymentMethodSelector({
  selected,
  onSelect,
  clinicTier,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-steel-300">
        Payment Method
      </label>

      <div className="grid gap-3">
        {OPTIONS.map((option) => {
          const isCardDisabled =
            option.value === 'card' && clinicTier === 'new'
          const isActive = selected === option.value
          const Icon = option.icon

          return (
            <button
              key={option.value}
              type="button"
              disabled={isCardDisabled}
              onClick={() => onSelect(option.value)}
              className={cn(
                'relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
                isActive
                  ? 'border-accent-purple bg-accent-purple/10'
                  : 'border-white/10 bg-white/5',
                isCardDisabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:border-white/20'
              )}
            >
              {/* Radio indicator */}
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isActive
                    ? 'border-accent-purple bg-accent-purple'
                    : 'border-white/20 bg-transparent'
                )}
              >
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-steel-400" />
                  <span className="text-sm font-medium text-white">
                    {option.label}
                  </span>
                  {isCardDisabled && (
                    <Lock className="h-3.5 w-3.5 text-steel-500" />
                  )}
                </div>
                <p className="mt-1 text-xs text-steel-400">
                  {isCardDisabled
                    ? 'Available after your first completed wire transfer order.'
                    : option.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
