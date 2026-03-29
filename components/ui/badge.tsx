import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variant === 'default' && 'bg-white/10 text-steel-300',
        variant === 'accent' && 'bg-accent-purple/15 text-accent-purple',
        variant === 'outline' && 'border border-white/20 text-steel-300',
        className
      )}
    >
      {children}
    </span>
  )
}
