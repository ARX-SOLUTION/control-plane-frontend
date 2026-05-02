import { api } from '@/lib/api'
import type { EnvVar } from '@/types'

export function listEnvVars(environmentId: string) {
  return api<EnvVar[]>(`/env-vars?environmentId=${environmentId}`)
}

export function getEnvVar(id: string) {
  return api<EnvVar>(`/env-vars/${id}`)
}

export function createEnvVar(data: { environmentId: string; key: string; value: string }) {
  return api<EnvVar>('/env-vars', { method: 'POST', json: data })
}

/** POST /env-vars/:id/reveal → { id, key, value, version } */
export function revealEnvVar(id: string) {
  return api<{ id: string; key: string; value: string; version: number }>(
    `/env-vars/${id}/reveal`,
    { method: 'POST' },
  )
}

export function updateEnvVar(id: string, data: { value?: string; isActive?: boolean }) {
  return api<EnvVar>(`/env-vars/${id}`, { method: 'PATCH', json: data })
}

export function deleteEnvVar(id: string) {
  return api(`/env-vars/${id}`, { method: 'DELETE' })
}
