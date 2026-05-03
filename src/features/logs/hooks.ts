import { useQuery } from '@tanstack/react-query'
import { queryLogs } from './api'

export function useLogsQuery(
  query: string,
  start?: string,
  end?: string,
  limit = 200,
) {
  return useQuery({
    queryKey: ['logs', query, start, end, limit],
    queryFn: () => queryLogs({ query, start, end, limit }),
    refetchInterval: 15_000,
    retry: false,
  })
}
