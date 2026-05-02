import { useEffect } from 'react'
import { useNavigate, Outlet } from '@tanstack/react-router'
import { setOn401 } from '@/lib/api'

/**
 * Root providers component — rendered as the root route's component so it has
 * full access to the router context. Wires up the global 401 handler so any
 * unauthenticated API response immediately redirects to /login.
 *
 * Deliberately kept thin: QueryClientProvider, Toaster, and ReactQueryDevtools
 * live in main.tsx so they're available outside the router tree too.
 */
export function Providers() {
  const navigate = useNavigate()

  useEffect(() => {
    setOn401(() => {
      navigate({ to: '/login', replace: true })
    })
  }, [navigate])

  return <Outlet />
}
