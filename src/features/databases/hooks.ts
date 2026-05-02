import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listDatabases,
  getDatabase,
  createDatabase,
  getDatabaseConnectionString,
  deleteDatabase,
} from './api'
import type { DatabaseType } from '@/types'

export function useDatabasesQuery(projectId?: string) {
  return useQuery({
    queryKey: ['databases', projectId],
    queryFn: () => listDatabases(projectId),
  })
}

export function useDatabaseQuery(id: string) {
  return useQuery({
    queryKey: ['databases', id],
    queryFn: () => getDatabase(id),
    enabled: !!id,
  })
}

export function useCreateDatabaseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { projectId: string; type: DatabaseType; name: string }) =>
      createDatabase(data),
    onSuccess: (db) => {
      queryClient.invalidateQueries({ queryKey: ['databases', db.projectId] })
    },
  })
}

/** Mutation — reveals the connection string; result is intentionally not cached. */
export function useGetConnectionStringMutation() {
  return useMutation({
    mutationFn: (id: string) => getDatabaseConnectionString(id),
  })
}

export function useDeleteDatabaseMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) => deleteDatabase(id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['databases', projectId] })
    },
  })
}
