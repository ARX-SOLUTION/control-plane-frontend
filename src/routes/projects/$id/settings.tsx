import * as React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Copy, Check, Webhook, GitBranch, Trash2, AlertTriangle } from 'lucide-react'
import {
  useProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '@/features/projects/hooks'
import {
  useBranchesQuery,
  useGenerateWebhookSecretMutation,
  useRevokeWebhookSecretMutation,
} from '@/features/vcs/hooks'
import { updateProjectSchema, type UpdateProjectInput } from '@/features/projects/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-fg-subtle">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

// ─── Webhook secret dialog ────────────────────────────────────────────────────

function WebhookSecretDialog({
  secret,
  onClose,
}: {
  secret: string
  onClose: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Webhook Secret</DialogTitle>
          <DialogDescription>
            Copy this secret now — it will not be shown again.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-bg-0 border border-border rounded-md p-3">
          <code className="text-sm font-mono break-all text-fg">{secret}</code>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={copy}>
            {copied ? (
              <><Check className="h-3.5 w-3.5" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy Secret</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete project dialog ────────────────────────────────────────────────────

function DeleteProjectDialog({
  projectName,
  displayName,
  onConfirm,
  onClose,
  isPending,
}: {
  projectName: string
  displayName: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  const [typed, setTyped] = React.useState('')
  const confirmed = typed === projectName

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This will permanently delete <span className="font-medium text-fg">{displayName}</span> and
            all associated data including environments, deployments, and databases. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label className="text-sm">
            Type <code className="font-mono bg-bg-2 px-1.5 py-0.5 rounded text-xs">{projectName}</code> to confirm:
          </Label>
          <Input
            placeholder={projectName}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            invalid={typed.length > 0 && !confirmed}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            loading={isPending}
            disabled={!confirmed}
            onClick={onConfirm}
          >
            <Trash2 className="h-4 w-4" />
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectSettingsPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()

  const { data: project, isLoading } = useProjectQuery(id)
  const { mutate: updateProject, isPending: updating } = useUpdateProjectMutation()
  const { mutate: deleteProject, isPending: deleting } = useDeleteProjectMutation()
  const { mutate: generateSecret, isPending: generating } = useGenerateWebhookSecretMutation()
  const { mutate: revokeSecret, isPending: revoking } = useRevokeWebhookSecretMutation()
  const { data: branchesData } = useBranchesQuery(id)

  const [webhookSecret, setWebhookSecret] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
  })

  // Populate form when project loads
  React.useEffect(() => {
    if (project) {
      reset({
        displayName: project.displayName,
        githubUrl: project.githubUrl ?? undefined,
        branch: project.branch ?? 'main',
        buildCommand: project.buildCommand ?? undefined,
        startCommand: project.startCommand ?? undefined,
        appPort: project.appPort,
        healthCheckPath: project.healthCheckPath ?? '/',
        healthCheckInterval: project.healthCheckInterval ?? undefined,
      })
    }
  }, [project, reset])

  const onSubmit = (data: UpdateProjectInput) => {
    updateProject(
      { id, data },
      {
        onSuccess: () => toast.success('Project settings saved'),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to save settings'),
      }
    )
  }

  const handleGenerateSecret = () => {
    generateSecret(id, {
      onSuccess: (data) => setWebhookSecret((data as { secret: string }).secret),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to generate secret'),
    })
  }

  const handleRevokeSecret = () => {
    revokeSecret(id, {
      onSuccess: () => toast.success('Webhook secret revoked'),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to revoke secret'),
    })
  }

  const handleDelete = () => {
    deleteProject(id, {
      onSuccess: () => {
        toast.success('Project deleted')
        navigate({ to: '/projects' })
      },
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to delete project'),
    })
  }

  const webhookUrl = `${window.location.origin}/api/vcs/webhook/github/${id}`
  const branches = branchesData?.branches ?? []
  const selectedBranch = watch('branch')

  if (isLoading || !project) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl space-y-8">
        {/* ── General settings form ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-fg">General</h2>
            <p className="text-sm text-fg-muted">Update project configuration</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-bg-1 border border-border rounded-lg p-5 space-y-4">
              <Field label="Display Name" error={errors.displayName?.message}>
                <Input
                  placeholder="My App"
                  invalid={!!errors.displayName}
                  {...register('displayName')}
                />
              </Field>

              <Field label="GitHub URL" error={errors.githubUrl?.message}>
                <Input
                  type="url"
                  placeholder="https://github.com/org/repo"
                  invalid={!!errors.githubUrl}
                  {...register('githubUrl')}
                />
              </Field>

              <Field label="Branch" error={errors.branch?.message}>
                {branches.length > 0 ? (
                  <Select
                    value={selectedBranch ?? ''}
                    onValueChange={(v) => setValue('branch', v, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b} value={b}>
                          <span className="inline-flex items-center gap-1.5">
                            <GitBranch className="h-3 w-3" />
                            {b}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="main"
                    invalid={!!errors.branch}
                    {...register('branch')}
                  />
                )}
              </Field>

              <Field
                label="Build Command"
                hint="Optional"
                error={errors.buildCommand?.message}
              >
                <Input
                  placeholder="npm run build"
                  className="font-mono text-sm"
                  {...register('buildCommand')}
                />
              </Field>

              <Field
                label="Start Command"
                hint="Optional"
                error={errors.startCommand?.message}
              >
                <Input
                  placeholder="node dist/index.js"
                  className="font-mono text-sm"
                  {...register('startCommand')}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="App Port" error={errors.appPort?.message}>
                  <Input
                    type="number"
                    placeholder="3000"
                    invalid={!!errors.appPort}
                    {...register('appPort', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Health Check Path" error={errors.healthCheckPath?.message}>
                  <Input
                    placeholder="/"
                    className="font-mono text-sm"
                    {...register('healthCheckPath')}
                  />
                </Field>
              </div>

              <Field
                label="Health Check Interval (s)"
                hint="How often to check health (10–300 seconds)"
                error={errors.healthCheckInterval?.message}
              >
                <Input
                  type="number"
                  placeholder="30"
                  invalid={!!errors.healthCheckInterval}
                  {...register('healthCheckInterval', { valueAsNumber: true })}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={updating} disabled={!isDirty}>
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* ── Webhook section ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-fg">GitHub Webhook</h2>
            <p className="text-sm text-fg-muted">
              Configure automatic deployments on push
            </p>
          </div>
          <div className="bg-bg-1 border border-border rounded-lg p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Webhook URL</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-bg-0 border border-border rounded px-3 py-2 text-fg-muted break-all">
                  {webhookUrl}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl)
                    toast.success('URL copied')
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-fg-subtle">
                Add this URL to your GitHub repository webhook settings (payload URL).
                Set content type to <code className="font-mono">application/json</code>.
              </p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="secondary"
                onClick={handleGenerateSecret}
                loading={generating}
              >
                <Webhook className="h-4 w-4" />
                Generate Secret
              </Button>
              <Button
                variant="ghost"
                onClick={handleRevokeSecret}
                loading={revoking}
                className="text-danger hover:text-danger"
              >
                Revoke Secret
              </Button>
            </div>
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-danger">Danger Zone</h2>
            <p className="text-sm text-fg-muted">Irreversible and destructive actions</p>
          </div>
          <div className="bg-bg-1 border border-danger/30 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-fg">Delete Project</p>
                <p className="text-xs text-fg-muted mt-0.5">
                  Permanently delete this project and all its data
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Webhook secret dialog ── */}
      {webhookSecret && (
        <WebhookSecretDialog
          secret={webhookSecret}
          onClose={() => setWebhookSecret(null)}
        />
      )}

      {/* ── Delete dialog ── */}
      {deleteOpen && (
        <DeleteProjectDialog
          projectName={project.name}
          displayName={project.displayName}
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
          isPending={deleting}
        />
      )}
    </>
  )
}
