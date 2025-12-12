import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'pending' | 'negotiation' | 'listed' | 'completed' | 'cancelled'
}

export default function Badge({
  className,
  variant = 'pending',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    negotiation: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    listed: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    completed: 'bg-green-500/20 text-green-400 border-green-500/50',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/50',
  }

  const labels = {
    pending: '保留中',
    negotiation: '交渉中',
    listed: '出品中',
    completed: '完了',
    cancelled: 'キャンセル',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children || labels[variant]}
    </span>
  )
}

