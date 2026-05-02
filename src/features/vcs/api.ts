import { api } from '@/lib/api'

/** GET /vcs/:projectId/branches → { branches: string[] } */
export function getBranches(projectId: string) {
  return api<{ branches: string[] }>(`/vcs/${projectId}/branches`)
}

/** POST /vcs/:projectId/webhook-secret → { secret } */
export function generateWebhookSecret(projectId: string) {
  return api<{ secret: string }>(`/vcs/${projectId}/webhook-secret`, { method: 'POST' })
}

/** DELETE /vcs/:projectId/webhook-secret */
export function revokeWebhookSecret(projectId: string) {
  return api(`/vcs/${projectId}/webhook-secret`, { method: 'DELETE' })
}
