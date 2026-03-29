import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconWrapperProps {
  name: string
  className?: string
  size?: number
}

export function IconWrapper({ name, className, size = 24 }: IconWrapperProps) {
  const Icon = (LucideIcons as Record<string, any>)[name]
  if (!Icon) return null
  return <Icon className={cn('text-accent-purple', className)} size={size} />
}
