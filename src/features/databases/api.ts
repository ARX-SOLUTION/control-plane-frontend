import { api } from '@/lib/api'
import type { Database, DatabaseType } from '@/types'

export function listDatabases(projectId?: string) {
  const qs = projectId ? `?projectId=${projectId}` : ''
  return api<Database[]>(`/databases${qs}`)
}

export function getDatabase(id: string) {
  return api<Database>(`/databases/${id}`)
}

export function createDatabase(data: { projectId: string; type: DatabaseType; name: string }) {
  return api<Database>('/databases', { method: 'POST', json: data })
}

/** POST /databases/:id/connection-string → { connectionString } */
export function getDatabaseConnectionString(id: string) {
  return api<{ connectionString: string }>(`/databases/${id}/connection-string`, {
    method: 'POST',
  })
}

export function deleteDatabase(id: string) {
  return api(`/databases/${id}`, { method: 'DELETE' })
}
