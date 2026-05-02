import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listEnvironments,
  getEnvironment,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
} from './api'
import type { EnvironmentName } from '@/types'

export function useEnvironmentsQuery(projectId?: string) {
  return useQuery({
    queryKey: ['environments', projectId],
    queryFn: () => listEnvironments(projectId),
  })
}

export function useEnvironmentQuery(id: string) {
  return useQuery({
    queryKey: ['environments', id],
    queryFn: () => getEnvironment(id),
    enabled: !!id,
  })
}

export function useCreateEnvironmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { projectId: string; name: EnvironmentName; displayName: string }) =>
      createEnvironment(data),
    onSuccess: (env) => {
      queryClient.invalidateQueries({ queryKey: ['environments', env.projectId] })
    },
  })
}

export function useUpdateEnvironmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<{ name: EnvironmentName; displayName: string }>
    }) => updateEnvironment(id, data),
    onSuccess: (env) => {
      queryClient.invalidateQueries({ queryKey: ['environments', env.projectId] })
    },
  })
}

export function useDeleteEnvironmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEnvironment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['environments'] })
    },
  })
}
