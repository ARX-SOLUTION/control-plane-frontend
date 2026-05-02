import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { LogLine } from '@/types'

// ─── Mock / placeholder log lines ─────────────────────────────────────────────

type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'text-fg-subtle',
  INFO:  'text-accent',
  WARN:  'text-warning',
  ERROR: 'text-danger',
}

// ─── Log line component ───────────────────────────────────────────────────────

function LogLineRow({ line }: { line: LogLine }) {
  return (
    <div className="flex gap-3 py-0.5 hover:bg-bg-2/30 px-2 -mx-2 rounded">
      <span className="text-fg-subtle shrink-0 tabular-nums">
        {new Date(line.timestamp).toISOString().slice(11, 23)}
      </span>
      <span className={cn('shrink-0 w-12 font-semibold', LEVEL_COLORS[line.level] ?? 'text-fg-muted')}>
        {line.level}
      </span>
      <span className="text-fg-subtle shrink-0 hidden sm:block">[{line.source}]</span>
      <span className="text-fg break-all">{line.message}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectLogsPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: environments = [], isLoading: envsLoading } = useEnvironmentsQuery(id)

  const [selectedEnvId, setSelectedEnvId] = React.useState<string>('')
  const [levelFilter, setLevelFilter] = React.useState<LogLevel>('ALL')
  const [loaded, setLoaded] = React.useState(false)
  const [logs] = React.useState<LogLine[]>([])

  React.useEffect(() => {
    if (!selectedEnvId && environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    }
  }, [environments, selectedEnvId])

  const LEVELS: LogLevel[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR']

  const filteredLogs =
    levelFilter === 'ALL'
      ? logs
      : logs.filter((l) => l.level === levelFilter)

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Logs</h1>
          <p className="text-sm text-fg-muted">Application log output</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-fg-muted shrink-0">Env:</Label>
          {envsLoading ? (
            <Skeleton className="h-9 w-28" />
          ) : (
            <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLoaded(true)}
            disabled={!selectedEnvId}
          >
            Load Logs
          </Button>
        </div>
      </div>

      {/* ── Level filter chips ── */}
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
                : 'bg-bg-2 text-fg-muted hover:bg-bg-3 hover:text-fg'
            )}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* ── Log viewer ── */}
      <div className="bg-bg-0 border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-bg-1 border-b border-border flex items-center justify-between">
          <span className="text-xs text-fg-muted font-mono">
            {filteredLogs.length} line{filteredLogs.length !== 1 ? 's' : ''}
          </span>
          {loaded && filteredLogs.length === 0 && (
            <span className="text-xs text-fg-subtle">Live tail not available on this page — use deployment logs for real-time output</span>
          )}
        </div>
        <div className="p-4 font-mono text-xs text-fg min-h-[320px] max-h-[560px] overflow-y-auto">
          {!loaded ? (
            <p className="text-fg-subtle text-center py-12">
              Select an environment and click "Load Logs" to view recent log output.
            </p>
          ) : filteredLogs.length === 0 ? (
            <p className="text-fg-subtle text-center py-12">
              No log entries match the current filter.
            </p>
          ) : (
            filteredLogs.map((line, i) => <LogLineRow key={i} line={line} />)
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-fg-subtle">
        For live log tailing, open a deployment detail and expand the log sections.
        WebSocket streaming is available per-deployment.
      </p>
    </div>
  )
}
