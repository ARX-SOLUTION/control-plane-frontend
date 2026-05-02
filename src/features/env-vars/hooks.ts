import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listEnvVars,
  revealEnvVar,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
} from './api'

export function useEnvVarsQuery(environmentId: string) {
  return useQuery({
    queryKey: ['env-vars', environmentId],
    queryFn: () => listEnvVars(environmentId),
    enabled: !!environmentId,
  })
}

/** Mutation — reveal is a POST that returns the plaintext value; not cached. */
export function useRevealEnvVarMutation() {
  return useMutation({
    mutationFn: (id: string) => revealEnvVar(id),
  })
}

export function useCreateEnvVarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { environmentId: string; key: string; value: string }) =>
      createEnvVar(data),
    onSuccess: (envVar) => {
      queryClient.invalidateQueries({ queryKey: ['env-vars', envVar.environmentId] })
    },
  })
}

export function useUpdateEnvVarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { value?: string; isActive?: boolean }
    }) => updateEnvVar(id, data),
    onSuccess: (envVar) => {
      queryClient.invalidateQueries({ queryKey: ['env-vars', envVar.environmentId] })
    },
  })
}

export function useDeleteEnvVarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; environmentId: string }) => deleteEnvVar(id),
    onSuccess: (_, { environmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['env-vars', environmentId] })
    },
  })
}
