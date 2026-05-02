import { api } from '@/lib/api'
import type { Domain } from '@/types'

export function listDomains(environmentId?: string) {
  const qs = environmentId ? `?environmentId=${environmentId}` : ''
  return api<Domain[]>(`/domains${qs}`)
}

export function getDomain(id: string) {
  return api<Domain>(`/domains/${id}`)
}

export function createDomain(data: {
  environmentId: string
  domain: string
  cloudflareZoneId?: string
  serverIp?: string
}) {
  return api<Domain>('/domains', { method: 'POST', json: data })
}

export function deleteDomain(id: string) {
  return api(`/domains/${id}`, { method: 'DELETE' })
}
