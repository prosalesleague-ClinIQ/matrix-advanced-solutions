import { cn } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'
import type { OrderStatus } from '@/lib/types/database'

const statusColors: Record<OrderStatus, string> = {
  draft: 'bg-steel-600/20 text-steel-400',
  submitted: 'bg-accent-blue/15 text-accent-blue-light',
  confirmed: 'bg-accent-purple/15 text-accent-purple-light',
  processing: 'bg-yellow-500/15 text-yellow-400',
  shipped: 'bg-cyan-500/15 text-accent-cyan',
  delivered: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        statusColors[status] ?? 'bg-white/10 text-steel-300',
        className
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  )
}
