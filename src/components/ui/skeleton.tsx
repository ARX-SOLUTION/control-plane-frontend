import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'block'
}

function Skeleton({ className, variant = 'line', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-bg-2',
        variant === 'line' && 'h-4 w-full',
        variant === 'block' && 'h-full w-full',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
