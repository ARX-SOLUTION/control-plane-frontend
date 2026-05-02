import { api } from '@/lib/api'

/** GET /monitoring/query — Prometheus instant query */
export function queryInstant(params: { query: string; time?: string }) {
  const qs = new URLSearchParams({ query: params.query })
  if (params.time) qs.set('time', params.time)
  return api<unknown>(`/monitoring/query?${qs.toString()}`)
}

/** GET /monitoring/query_range — Prometheus range query */
export function queryRange(params: {
  query: string
  start: string
  end: string
  step?: string
}) {
  const qs = new URLSearchParams({
    query: params.query,
    start: params.start,
    end: params.end,
  })
  if (params.step) qs.set('step', params.step)
  return api<unknown>(`/monitoring/query_range?${qs.toString()}`)
}
