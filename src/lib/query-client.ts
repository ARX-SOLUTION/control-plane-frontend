import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
})

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { message: string; errors?: Record<string, string[]> },
  ) {
    super(body.message)
    this.name = 'ApiError'
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: { message: string; errors?: Record<string, string[]> }
    try {
      body = await res.json()
    } catch {
      body = { message: `HTTP ${res.status} ${res.statusText}` }
    }
    return new ApiError(res.status, body)
  }
}
