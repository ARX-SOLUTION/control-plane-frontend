import * as React from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  useCreateProjectMutation,
} from '@/features/projects/hooks'
import {
  createProjectSchema,
  type CreateProjectInput,
} from '@/features/projects/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 255)
}

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-fg-subtle">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  const navigate = useNavigate()
  const { mutate: createProject, isPending } = useCreateProjectMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      branch: 'main',
      healthCheckPath: '/',
      appPort: 3000,
    },
  })

  // Auto-slugify name from displayName
  const displayName = watch('displayName')
  const nameRef = React.useRef<boolean>(false)
  React.useEffect(() => {
    if (!nameRef.current) {
      setValue('name', slugify(displayName ?? ''), { shouldValidate: false })
    }
  }, [displayName, setValue])

  const onSubmit = (data: CreateProjectInput) => {
    createProject(data, {
      onSuccess: (project) => {
        toast.success(`Project "${project.displayName}" created`)
        navigate({ to: '/projects/$id', params: { id: project.id } })
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Failed to create project')
      },
    })
  }

  return (
    <div className="max-w-2xl">
      {/* Header + breadcrumb */}
      <div className="mb-6">
        <nav className="text-sm text-fg-muted mb-1">
          <Link to="/projects" className="hover:text-fg transition-colors">
            Projects
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-fg">New Project</span>
        </nav>
        <h1 className="text-xl font-semibold text-fg">New Project</h1>
        <p className="text-sm text-fg-muted">Configure a new application to deploy</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Basic info ── */}
        <div className="bg-bg-1 border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wide">
            Basic Info
          </h2>

          <Field
            label="Display Name"
            required
            error={errors.displayName?.message}
          >
            <Input
              placeholder="My App"
              invalid={!!errors.displayName}
              {...register('displayName')}
            />
          </Field>

          <Field
            label="Slug / Name"
            required
            hint="Lowercase letters, numbers, and hyphens only. Auto-generated from display name."
            error={errors.name?.message}
          >
            <Input
              placeholder="my-app"
              invalid={!!errors.name}
              className="font-mono text-sm"
              {...register('name', {
                onChange: () => { nameRef.current = true },
              })}
            />
          </Field>
        </div>

        {/* ── Source ── */}
        <div className="bg-bg-1 border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wide">
            Source
          </h2>

          <Field
            label="GitHub URL"
            hint="e.g. https://github.com/org/repo"
            error={errors.githubUrl?.message}
          >
            <Input
              type="url"
              placeholder="https://github.com/org/repo"
              invalid={!!errors.githubUrl}
              {...register('githubUrl')}
            />
          </Field>

          <Field
            label="Branch"
            error={errors.branch?.message}
          >
            <Input
              placeholder="main"
              invalid={!!errors.branch}
              {...register('branch')}
            />
          </Field>
        </div>

        {/* ── Build ── */}
        <div className="bg-bg-1 border border-border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wide">
            Build & Runtime
          </h2>

          <Field
            label="Build Command"
            hint="Optional — leave blank if no build step is needed"
            error={errors.buildCommand?.message}
          >
            <Input
              placeholder="npm run build"
              className="font-mono text-sm"
              invalid={!!errors.buildCommand}
              {...register('buildCommand')}
            />
          </Field>

          <Field
            label="Start Command"
            hint="Optional — command to start the application"
            error={errors.startCommand?.message}
          >
            <Input
              placeholder="node dist/index.js"
              className="font-mono text-sm"
              invalid={!!errors.startCommand}
              {...register('startCommand')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="App Port"
              error={errors.appPort?.message}
            >
              <Input
                type="number"
                placeholder="3000"
                invalid={!!errors.appPort}
                {...register('appPort', { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Health Check Path"
              error={errors.healthCheckPath?.message}
            >
              <Input
                placeholder="/"
                className="font-mono text-sm"
                invalid={!!errors.healthCheckPath}
                {...register('healthCheckPath')}
              />
            </Field>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={cn('flex items-center gap-3 justify-end')}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: '/projects' })}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Create Project
          </Button>
        </div>
      </form>
    </div>
  )
}
