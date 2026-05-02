import { useQuery } from '@tanstack/react-query'
import { queryInstant, queryRange } from './api'
import { api } from '@/lib/api'

export function useInstantQuery(query: string, time?: string) {
  return useQuery({
    queryKey: ['monitoring', 'instant', query, time],
    queryFn: () => queryInstant({ query, time }),
    enabled: query.length > 0,
  })
}

export function useRangeQuery(query: string, start: string, end: string, step?: string) {
  return useQuery({
    queryKey: ['monitoring', 'range', query, start, end, step],
    queryFn: () => queryRange({ query, start, end, step }),
    enabled: query.length > 0,
  })
}

export function useGrafanaConfig() {
  return useQuery({
    queryKey: ['grafana', 'config'],
    queryFn: () => api<unknown>('/grafana/config'),
  })
}

export function useGrafanaPanelUrl(dashboard: string, panelId: string | number) {
  return useQuery({
    queryKey: ['grafana', 'panel', dashboard, panelId],
    queryFn: () =>
      api<unknown>(`/grafana/panel?dashboard=${encodeURIComponent(dashboard)}&panelId=${panelId}`),
    enabled: !!dashboard && panelId !== undefined && panelId !== '',
  })
}
