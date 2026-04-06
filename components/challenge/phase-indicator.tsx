'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChallengePhase } from '@/lib/types/challenge'

const PHASES: { key: ChallengePhase; label: string }[] = [
  { key: 'baseline', label: 'Baseline' },
  { key: 'protocol', label: 'Protocol' },
  { key: 'results', label: 'Results' },
]

const PHASE_ORDER: Record<ChallengePhase, number> = {
  baseline: 0,
  protocol: 1,
  results: 2,
}

interface PhaseIndicatorProps {
  currentPhase: ChallengePhase
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASE_ORDER[currentPhase]

  return (
    <div className="flex items-center justify-center gap-0">
      {PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <div key={phase.key} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-accent-cyan text-white',
                  isCurrent &&
                    'bg-gradient-to-r from-accent-purple to-accent-cyan text-white ring-4 ring-accent-cyan/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
                  isFuture && 'bg-white/5 text-steel-500'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium',
                  isCompleted && 'text-accent-cyan',
                  isCurrent && 'text-white',
                  isFuture && 'text-steel-500'
                )}
              >
                {phase.label}
              </span>
            </div>

            {/* Connecting line */}
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  'mx-3 mb-6 h-0.5 w-16 rounded-full sm:w-24',
                  index < currentIndex
                    ? 'bg-gradient-to-r from-accent-purple to-accent-cyan'
                    : 'bg-white/8'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
