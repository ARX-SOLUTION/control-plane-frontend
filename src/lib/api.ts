import { ApiError } from './query-client'

// Global 401 handler — set by providers
let on401: (() => void) | null = null
export function setOn401(handler: () => void) {
  on401 = handler
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, ...fetchInit } = init

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchInit.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers,
    ...fetchInit,
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  })

  if (res.status === 401) {
    on401?.()
    throw await ApiError.fromResponse(res)
  }

  if (!res.ok) {
    throw await ApiError.fromResponse(res)
  }

  // 204 No Content
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }

  return res.json() as Promise<T>
}
