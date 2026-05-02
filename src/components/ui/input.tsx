import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border bg-bg-1 px-3 py-1 text-sm text-fg',
          'placeholder:text-fg-subtle',
          'transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid
            ? 'border-danger focus:ring-danger'
            : 'border-border hover:border-border-strong',
          className
        )}
        aria-invalid={invalid}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
