import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDomains, getDomain, createDomain, deleteDomain } from './api'

export function useDomainsQuery(environmentId?: string) {
  return useQuery({
    queryKey: ['domains', environmentId],
    queryFn: () => listDomains(environmentId),
  })
}

export function useDomainQuery(id: string) {
  return useQuery({
    queryKey: ['domains', id],
    queryFn: () => getDomain(id),
    enabled: !!id,
  })
}

export function useCreateDomainMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      environmentId: string
      domain: string
      cloudflareZoneId?: string
      serverIp?: string
    }) => createDomain(data),
    onSuccess: (domain) => {
      queryClient.invalidateQueries({ queryKey: ['domains', domain.environmentId] })
    },
  })
}

export function useDeleteDomainMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; environmentId: string }) => deleteDomain(id),
    onSuccess: (_, { environmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['domains', environmentId] })
    },
  })
}
