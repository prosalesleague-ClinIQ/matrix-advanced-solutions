'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MeasurementKey } from '@/lib/types/challenge'

/** Measurement keys where a decrease is positive progress */
const DECREASE_IS_GOOD: MeasurementKey[] = ['weight', 'body_fat_pct', 'waist']

interface MeasurementCardProps {
  label: string
  value: number | null
  unit: string
  baselineValue?: number | null
  measurementKey?: MeasurementKey
}

export function MeasurementCard({
  label,
  value,
  unit,
  baselineValue,
  measurementKey,
}: MeasurementCardProps) {
  const delta =
    value != null && baselineValue != null ? value - baselineValue : null

  const isPositiveChange =
    delta != null && measurementKey
      ? DECREASE_IS_GOOD.includes(measurementKey)
        ? delta < 0
        : delta > 0
      : delta != null
        ? delta > 0
        : null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-1 text-xs font-medium text-steel-400">{label}</p>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white">
          {value != null ? value : '\u2014'}
        </span>
        {value != null && (
          <span className="text-sm text-steel-500">{unit}</span>
        )}
      </div>

      {delta != null && delta !== 0 && (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            isPositiveChange
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-red-500/15 text-red-400'
          )}
        >
          {delta < 0 ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )}
          <span>
            {delta > 0 ? '+' : ''}
            {delta.toFixed(1)} {unit}
          </span>
        </div>
      )}
    </div>
  )
}
