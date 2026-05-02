import * as React from 'react'
import { cn } from '@/lib/utils'
import type { LogLine } from '@/types'

type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'text-fg-subtle',
  INFO:  'text-accent',
  WARN:  'text-warning',
  ERROR: 'text-danger',
}

export default function GlobalLogsPage() {
  const [levelFilter, setLevelFilter] = React.useState<LogLevel>('ALL')
  const LEVELS: LogLevel[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Log Explorer</h1>
          <p className="text-sm text-fg-muted">Global application logs</p>
        </div>
      </div>

      {/* Time range + filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Level:</span>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevelFilter(lvl)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                levelFilter === lvl
                  ? 'bg-accent text-accent-fg'
                  : 'bg-bg-2 text-fg-muted hover:bg-bg-3 hover:text-fg'
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Log viewer */}
      <div className="bg-bg-0 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-bg-1 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-fg-muted">Output</span>
          <span className="text-xs text-fg-subtle">Read-only — no live tail on this page</span>
        </div>
        <div className="p-6 text-center font-mono text-xs min-h-[400px] flex flex-col items-center justify-center gap-3">
          <div className="text-fg-subtle text-3xl mb-2">📋</div>
          <p className="text-fg-muted font-sans text-sm">
            No WebSocket logs available on this page.
          </p>
          <p className="text-fg-subtle font-sans text-xs max-w-md">
            Use project log pages for environment-scoped log output, or open a
            deployment detail page to view build and deploy logs with live output.
          </p>
        </div>
      </div>

      <div className="mt-4 bg-bg-1 border border-border rounded-lg p-4">
        <p className="text-sm font-medium text-fg mb-1">Coming Soon</p>
        <p className="text-xs text-fg-muted">
          A global log aggregation view with time-range filtering and full-text search
          is planned for a future release. Logs will be ingested from all environments
          and stored in the audit database.
        </p>
      </div>
    </div>
  )
}
