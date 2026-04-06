'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Business', shortLabel: '1' },
  { label: 'Shipping', shortLabel: '2' },
  { label: 'Compliance', shortLabel: '3' },
  { label: 'Review', shortLabel: '4' },
]

interface OnboardingProgressProps {
  currentStep: number
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                i < currentStep &&
                  'bg-accent-purple/20 text-accent-purple border border-accent-purple/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
                i === currentStep &&
                  'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]',
                i > currentStep &&
                  'bg-white/5 text-steel-500 border border-white/10'
              )}
            >
              {i < currentStep ? <Check className="w-5 h-5" /> : step.shortLabel}
            </div>
            <span
              className={cn(
                'mt-1.5 text-xs font-medium hidden sm:block',
                i <= currentStep ? 'text-white' : 'text-steel-500'
              )}
            >
              {step.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-12 sm:w-20 mx-2',
                i < currentStep
                  ? 'bg-gradient-to-r from-accent-blue to-accent-purple'
                  : 'bg-white/8'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
