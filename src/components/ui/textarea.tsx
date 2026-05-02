import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-bg-1 px-3 py-2 text-sm text-fg',
          'placeholder:text-fg-subtle',
          'transition-colors resize-y',
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
Textarea.displayName = 'Textarea'

export { Textarea }
