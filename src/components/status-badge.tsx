import * as React from 'react'
import { type DeploymentStatus } from '@/types'
import { cn } from '@/lib/utils'

// ─── Configuration ────────────────────────────────────────────────────────────

type DotStyle = {
  dot: string
  bg: string
  text: string
  pulse: boolean
}

const STATUS_STYLES: Record<DeploymentStatus, DotStyle> = {
  pending: {
    dot: 'bg-fg-subtle',
    bg: 'bg-bg-3',
    text: 'text-fg-muted',
    pulse: false,
  },
  cloning: {
    dot: 'bg-accent',
    bg: 'bg-accent-soft',
    text: 'text-accent',
    pulse: true,
  },
  building: {
    dot: 'bg-accent',
    bg: 'bg-accent-soft',
    text: 'text-accent',
    pulse: true,
  },
  starting: {
    dot: 'bg-accent',
    bg: 'bg-accent-soft',
    text: 'text-accent',
    pulse: true,
  },
  health_check: {
    dot: 'bg-accent',
    bg: 'bg-accent-soft',
    text: 'text-accent',
    pulse: true,
  },
  switching: {
    dot: 'bg-accent',
    bg: 'bg-accent-soft',
    text: 'text-accent',
    pulse: true,
  },
  success: {
    dot: 'bg-success',
    bg: 'bg-success-soft',
    text: 'text-success',
    pulse: false,
  },
  failed: {
    dot: 'bg-danger',
    bg: 'bg-danger-soft',
    text: 'text-danger',
    pulse: false,
  },
  rolled_back: {
    dot: 'bg-warning',
    bg: 'bg-warning-soft',
    text: 'text-warning',
    pulse: false,
  },
}

const STATUS_LABELS: Record<DeploymentStatus, string> = {
  pending: 'Pending',
  cloning: 'Cloning',
  building: 'Building',
  starting: 'Starting',
  health_check: 'Health Check',
  switching: 'Switching',
  success: 'Success',
  failed: 'Failed',
  rolled_back: 'Rolled Back',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: DeploymentStatus
  className?: string
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        styles.bg,
        styles.text,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          styles.dot,
          styles.pulse && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export { StatusBadge }
export type { StatusBadgeProps }
