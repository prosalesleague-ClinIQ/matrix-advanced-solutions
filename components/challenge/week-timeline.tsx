'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface WeekTimelineProps {
  totalWeeks?: number
  completedWeeks: number[]
  currentWeek: number
}

export function WeekTimeline({
  totalWeeks = 12,
  completedWeeks,
  currentWeek,
}: WeekTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const weeks = Array.from({ length: totalWeeks + 1 }, (_, i) => i)

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
    >
      {weeks.map((week) => {
        const isCompleted = completedWeeks.includes(week)
        const isCurrent = week === currentWeek
        const isFuture = !isCompleted && !isCurrent

        return (
          <div key={week} className="flex items-center">
            {/* Week circle */}
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-200',
                isCompleted &&
                  'border-accent-cyan/40 bg-accent-cyan/20 text-accent-cyan',
                isCurrent &&
                  'border-transparent bg-gradient-to-r from-accent-purple to-accent-cyan text-white shadow-[0_0_16px_rgba(34,211,238,0.35)]',
                isFuture && 'border-white/10 bg-white/5 text-steel-500'
              )}
            >
              {week === 0 ? 'B' : week}
            </div>

            {/* Connecting line */}
            {week < totalWeeks && (
              <div
                className={cn(
                  'h-0.5 w-3 shrink-0',
                  isCompleted && completedWeeks.includes(week + 1)
                    ? 'bg-accent-cyan/40'
                    : isCompleted && week + 1 === currentWeek
                      ? 'bg-gradient-to-r from-accent-cyan/40 to-accent-purple/40'
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
