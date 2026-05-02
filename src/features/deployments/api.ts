import { api } from '@/lib/api'
import type { Deployment } from '@/types'

export function listDeployments(environmentId?: string) {
  const qs = environmentId ? `?environmentId=${environmentId}` : ''
  return api<Deployment[]>(`/deployments${qs}`)
}

export function getDeployment(id: string) {
  return api<Deployment>(`/deployments/${id}`)
}

export function createDeployment(data: { environmentId: string; branch?: string }) {
  return api<Deployment>('/deployments', { method: 'POST', json: data })
}

/** DELETE /deployments/:id — cancels an in-progress deployment */
export function cancelDeployment(id: string) {
  return api(`/deployments/${id}`, { method: 'DELETE' })
}
