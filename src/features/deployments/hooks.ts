import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listDeployments,
  getDeployment,
  createDeployment,
  cancelDeployment,
} from './api'

export function useDeploymentsQuery(
  environmentId?: string,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ['deployments', environmentId],
    queryFn: () => listDeployments(environmentId),
    refetchInterval: options?.refetchInterval,
  })
}

export function useDeploymentQuery(
  id: string,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ['deployments', id],
    queryFn: () => getDeployment(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  })
}

export function useCreateDeploymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { environmentId: string; branch?: string }) => createDeployment(data),
    onSuccess: (deployment) => {
      queryClient.invalidateQueries({ queryKey: ['deployments', deployment.environmentId] })
    },
  })
}

export function useCancelDeploymentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
    },
  })
}
