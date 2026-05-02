import { api } from '@/lib/api'
import type { Environment, EnvironmentName } from '@/types'

export function listEnvironments(projectId?: string) {
  const qs = projectId ? `?projectId=${projectId}` : ''
  return api<Environment[]>(`/environments${qs}`)
}

export function getEnvironment(id: string) {
  return api<Environment>(`/environments/${id}`)
}

export function createEnvironment(data: {
  projectId: string
  name: EnvironmentName
  displayName: string
}) {
  return api<Environment>('/environments', { method: 'POST', json: data })
}

export function updateEnvironment(
  id: string,
  data: Partial<{ name: EnvironmentName; displayName: string }>,
) {
  return api<Environment>(`/environments/${id}`, { method: 'PATCH', json: data })
}

export function deleteEnvironment(id: string) {
  return api(`/environments/${id}`, { method: 'DELETE' })
}
