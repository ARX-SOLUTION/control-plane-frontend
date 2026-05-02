import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBranches, generateWebhookSecret, revokeWebhookSecret } from './api'

export function useBranchesQuery(projectId: string) {
  return useQuery({
    queryKey: ['vcs', projectId, 'branches'],
    queryFn: () => getBranches(projectId),
    enabled: !!projectId,
  })
}

export function useGenerateWebhookSecretMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => generateWebhookSecret(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useRevokeWebhookSecretMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => revokeWebhookSecret(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}
