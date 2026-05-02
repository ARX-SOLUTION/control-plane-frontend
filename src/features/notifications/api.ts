import { api } from '@/lib/api'

/** POST /notifications/test → { ok: true } */
export function testNotifications() {
  return api<{ ok: true }>('/notifications/test', { method: 'POST' })
}
