import { api } from '@/lib/api'
import type { BackupFile } from '@/types'

/** GET /backup → BackupFile[] */
export function listBackups() {
  return api<BackupFile[]>('/backup')
}

/** POST /backup/trigger → { files: string[] } */
export function triggerBackup() {
  return api<{ files: string[] }>('/backup/trigger', { method: 'POST' })
}

/** DELETE /backup/:name */
export function deleteBackup(name: string) {
  return api(`/backup/${name}`, { method: 'DELETE' })
}
