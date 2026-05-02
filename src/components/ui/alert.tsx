import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-md border p-4 flex gap-3',
  {
    variants: {
      variant: {
        default:
          'bg-bg-1 border-border text-fg',
        danger:
          'bg-danger-soft border-danger/30 text-danger',
        warning:
          'bg-warning-soft border-warning/30 text-warning',
        info:
          'bg-info-soft border-info/30 text-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode
}

function Alert({ className, variant, icon, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {icon && (
        <span className="shrink-0 mt-0.5">{icon}</span>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
Alert.displayName = 'Alert'

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('font-medium text-sm leading-none mb-1', className)}
      {...props}
    />
  )
}
AlertTitle.displayName = 'AlertTitle'

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  )
}
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription, alertVariants }
