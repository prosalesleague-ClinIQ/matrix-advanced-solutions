import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-blue text-white hover:bg-blue-500 shadow-lg shadow-accent-blue/20 hover:shadow-accent-blue/30',
  secondary:
    'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30',
  ghost: 'text-white hover:bg-white/8',
  outline: 'border border-white/20 text-white hover:bg-white/5 hover:border-white/30',
  link: 'text-accent-blue hover:text-accent-cyan underline-offset-4 hover:underline p-0',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          variant !== 'link' && sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, type ButtonProps }
