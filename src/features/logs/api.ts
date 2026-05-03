import { api } from '@/lib/api'

export interface LokiStream {
  stream: Record<string, string>
  values: [string, string][]
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'UNKNOWN'

export interface ParsedLogEntry {
  ts: number
  timestamp: string
  level: LogLevel
  message: string
  labels: Record<string, string>
}

export async function queryLogs(params: {
  query: string
  start?: string
  end?: string
  limit?: number
}): Promise<ParsedLogEntry[]> {
  const qs = new URLSearchParams({ query: params.query })
  if (params.start) qs.set('start', params.start)
  if (params.end) qs.set('end', params.end)
  if (params.limit) qs.set('limit', String(params.limit))

  const streams: LokiStream[] = await api(`/logs?${qs}`)

  const entries: ParsedLogEntry[] = []
  for (const s of streams ?? []) {
    for (const [nsTs, line] of s.values ?? []) {
      const ts = Math.floor(Number(nsTs) / 1_000_000)
      entries.push({
        ts,
        timestamp: new Date(ts).toISOString(),
        level: detectLevel(line),
        message: line,
        labels: s.stream,
      })
    }
  }

  return entries.sort((a, b) => b.ts - a.ts)
}

function detectLevel(line: string): LogLevel {
  const u = line.toUpperCase()
  if (u.includes('ERROR') || u.includes('FATAL') || u.includes('CRITICAL')) return 'ERROR'
  if (u.includes('WARN')) return 'WARN'
  if (u.includes('DEBUG')) return 'DEBUG'
  if (u.includes('INFO') || u.includes('LOG')) return 'INFO'
  return 'UNKNOWN'
}
