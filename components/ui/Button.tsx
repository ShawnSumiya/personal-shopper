import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-neon-pink text-white hover:bg-neon-pinkLight focus:ring-neon-pink shadow-lg shadow-neon-pink/50',
      secondary:
        'bg-neon-blue text-dark-bg hover:bg-neon-blue/80 focus:ring-neon-blue shadow-lg shadow-neon-blue/50',
      outline:
        'border-2 border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white focus:ring-neon-pink',
      ghost:
        'text-neon-pink hover:bg-dark-card hover:text-neon-pinkLight focus:ring-neon-pink',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button

