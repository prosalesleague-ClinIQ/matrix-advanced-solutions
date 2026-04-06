import { cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types/database'
import { Check } from 'lucide-react'

const STEPS: OrderStatus[] = [
  'submitted',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
]

interface OrderStatusStepperProps {
  currentStatus: OrderStatus
  className?: string
}

export function OrderStatusStepper({
  currentStatus,
  className,
}: OrderStatusStepperProps) {
  if (currentStatus === 'cancelled' || currentStatus === 'draft') {
    return (
      <div className={cn('rounded-2xl bg-surface-card border border-white/8 p-6', className)}>
        <p className="text-sm text-steel-400">
          Order status:{' '}
          <span className={currentStatus === 'cancelled' ? 'text-red-400' : 'text-steel-300'}>
            {ORDER_STATUS_LABELS[currentStatus]}
          </span>
        </p>
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(currentStatus)

  return (
    <div className={cn('rounded-2xl bg-surface-card border border-white/8 p-6', className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    isCompleted && 'bg-accent-purple text-white',
                    isCurrent &&
                      'bg-accent-purple/20 text-accent-purple-light ring-2 ring-accent-purple',
                    isUpcoming && 'bg-white/5 text-steel-500'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'text-xs whitespace-nowrap',
                    isCompleted && 'text-steel-300',
                    isCurrent && 'text-white font-medium',
                    isUpcoming && 'text-steel-500'
                  )}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-px flex-1',
                    index < currentIndex ? 'bg-accent-purple' : 'bg-white/10'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
