import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepStatus = 'pending' | 'running' | 'done' | 'failed'

export interface TimelineStep {
  name: string
  status: StepStatus
  startedAt?: string
  duration?: number
  logs?: string
}

interface DeploymentTimelineProps {
  steps: TimelineStep[]
  className?: string
}

// ─── Step dot ─────────────────────────────────────────────────────────────────

function StepDot({ status }: { status: StepStatus }) {
  const base = 'h-2.5 w-2.5 rounded-full shrink-0 mt-1'

  switch (status) {
    case 'done':
      return <span className={cn(base, 'bg-success')} aria-label="done" />
    case 'running':
      return <span className={cn(base, 'bg-accent animate-pulse')} aria-label="running" />
    case 'failed':
      return <span className={cn(base, 'bg-danger')} aria-label="failed" />
    case 'pending':
    default:
      return <span className={cn(base, 'bg-fg-subtle/40 border border-border-strong')} aria-label="pending" />
  }
}

// ─── Step label color ─────────────────────────────────────────────────────────

function stepTextClass(status: StepStatus): string {
  switch (status) {
    case 'done':    return 'text-fg'
    case 'running': return 'text-accent font-medium'
    case 'failed':  return 'text-danger font-medium'
    case 'pending': return 'text-fg-subtle'
  }
}

// ─── Individual step row ──────────────────────────────────────────────────────

function TimelineStepRow({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const [expanded, setExpanded] = React.useState(false)
  const hasLogs = Boolean(step.logs)

  return (
    <div className="flex gap-3">
      {/* Left column: dot + connector line */}
      <div className="flex flex-col items-center">
        <StepDot status={step.status} />
        {!isLast && (
          <div
            className={cn(
              'w-px flex-1 mt-1',
              step.status === 'done' ? 'bg-success/30' : 'bg-border'
            )}
          />
        )}
      </div>

      {/* Right column: content */}
      <div className={cn('flex-1 min-w-0 pb-4', isLast && 'pb-0')}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 text-sm leading-none',
              stepTextClass(step.status),
              hasLogs ? 'cursor-pointer hover:underline' : 'cursor-default'
            )}
            onClick={() => hasLogs && setExpanded((v) => !v)}
            aria-expanded={hasLogs ? expanded : undefined}
            disabled={!hasLogs}
          >
            {hasLogs && (
              expanded
                ? <ChevronDown className="h-3 w-3 shrink-0" />
                : <ChevronRight className="h-3 w-3 shrink-0" />
            )}
            <span className="capitalize">{step.name.replace(/_/g, ' ')}</span>
          </button>

          {step.duration != null && (
            <span className="text-xs text-fg-subtle shrink-0 tabular-nums">
              {formatDuration(step.duration)}
            </span>
          )}
        </div>

        {/* Expandable log slice */}
        {hasLogs && expanded && (
          <pre className={cn(
            'mt-2 p-3 rounded-md bg-bg-0 border border-border',
            'text-xs font-mono text-fg-muted leading-relaxed',
            'overflow-x-auto whitespace-pre-wrap break-words max-h-48 overflow-y-auto'
          )}>
            {step.logs}
          </pre>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function DeploymentTimeline({ steps, className }: DeploymentTimelineProps) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-fg-muted text-center py-4">
        No steps to display.
      </p>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {steps.map((step, index) => (
        <TimelineStepRow
          key={step.name}
          step={step}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  )
}

export { DeploymentTimeline }
