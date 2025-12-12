import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-dark-card border-2 border-dark-text/10 rounded-lg p-6 shadow-lg',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export default Card

