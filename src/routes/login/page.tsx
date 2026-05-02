import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLogin } from '@/features/auth/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginInput = z.infer<typeof loginSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    login(data, {
      onSuccess: () => {
        navigate({ to: '/projects' })
      },
      onError: (err: unknown) => {
        const message =
          err instanceof Error ? err.message : 'Invalid email or password'
        setError('root', { message })
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-bg-1 border border-border rounded-lg p-8 shadow-sm">
          {/* Branding */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-fg tracking-tight">
              Control Plane
            </h1>
            <p className="text-sm text-fg-muted mt-1">Admin Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* Root / server error */}
            {errors.root && (
              <div className="rounded-md bg-danger-soft border border-danger/30 px-3 py-2">
                <p className="text-sm text-danger">{errors.root.message}</p>
              </div>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
