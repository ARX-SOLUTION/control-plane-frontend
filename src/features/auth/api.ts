import { api } from '@/lib/api'
import type { User } from '@/types'

/** POST /auth/login → { id, email } */
export function login(email: string, password: string) {
  return api<{ id: string; email: string }>('/auth/login', {
    method: 'POST',
    json: { email, password },
  })
}

/** POST /auth/logout → void */
export function logout() {
  return api<void>('/auth/logout', { method: 'POST' })
}

/** GET /auth/me → User */
export function getMe() {
  return api<User>('/auth/me')
}
