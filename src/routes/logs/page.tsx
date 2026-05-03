import * as React from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLogsQuery } from '@/features/logs/hooks'
import type { LogLevel } from '@/features/logs/api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: 'text-fg-subtle',
  INFO: 'text-accent',
  WARN: 'text-warning',
  ERROR: 'text-danger',
  UNKNOWN: 'text-fg-muted',
}

const TIME_RANGES = [
  { label: 'Last 15 min', value: '15m' },
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
]

function offsetMs(range: string): number {
  const n = parseInt(range)
  if (range.endsWith('m')) return n * 60 * 1000
  if (range.endsWith('h')) return n * 60 * 60 * 1000
  return 60 * 60 * 1000
}

export default function GlobalLogsPage() {
  const [levelFilter, setLevelFilter] = React.useState<LogLevel | 'ALL'>('ALL')
  const [timeRange, setTimeRange] = React.useState('1h')
  const [queryInput, setQueryInput] = React.useState('{job="docker"}')
  const [activeQuery, setActiveQuery] = React.useState('{job="docker"}')

  const now = new Date()
  const start = new Date(now.getTime() - offsetMs(timeRange)).toISOString()
  const end = now.toISOString()

  const { data = [], isLoading, isError, error, refetch, isFetching } = useLogsQuery(
    activeQuery,
    start,
    end,
    500,
  )

  const filtered = levelFilter === 'ALL' ? data : data.filter((e) => e.level === levelFilter)

  const LEVELS: (LogLevel | 'ALL')[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Log Explorer</h1>
          <p className="text-sm text-fg-muted">Query logs via Loki</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Query bar */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          className="font-mono text-sm flex-1"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder='LogQL query, e.g. {job="docker"}'
          onKeyDown={(e) => e.key === 'Enter' && setActiveQuery(queryInput)}
        />
        <Button size="sm" onClick={() => setActiveQuery(queryInput)}>
          Run
        </Button>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level filter */}
      <div className="flex items-center gap-2 mb-4">
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
                : 'bg-bg-2 text-fg-muted hover:bg-bg-3 hover:text-fg',
            )}
          >
            {lvl}
          </button>
        ))}
        <span className="ml-auto text-xs text-fg-subtle">{filtered.length} entries</span>
      </div>

      {/* Log viewer */}
      <div className="bg-bg-0 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-bg-1 border-b border-border flex items-center justify-between">
          <span className="text-xs font-medium text-fg-muted font-mono">{activeQuery}</span>
          <span className="text-xs text-fg-subtle">auto-refresh 15s</span>
        </div>

        {isError && (
          <div className="flex items-center gap-2 p-4 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {(error as Error)?.message?.includes('LOKI_URL')
              ? 'Loki is not configured. Set LOKI_URL in .env.prod.'
              : (error as Error)?.message ?? 'Failed to fetch logs'}
          </div>
        )}

        {isLoading && (
          <div className="p-6 text-center text-xs text-fg-subtle font-mono">Loading…</div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-sm text-fg-muted">No log entries found.</p>
            <p className="text-xs text-fg-subtle mt-1">
              Make sure Loki is running and LOKI_URL is set in .env.prod.
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-auto max-h-[600px] font-mono text-xs">
            {filtered.map((entry, i) => (
              <div
                key={i}
                className="flex gap-3 px-4 py-0.5 hover:bg-bg-1 border-b border-border/40 last:border-0"
              >
                <span className="text-fg-subtle shrink-0 select-none">
                  {new Date(entry.ts).toLocaleTimeString()}
                </span>
                <span className={cn('shrink-0 w-14 uppercase', LEVEL_COLORS[entry.level])}>
                  {entry.level === 'UNKNOWN' ? '' : entry.level}
                </span>
                <span className="text-fg break-all whitespace-pre-wrap">{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
