import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import {
  useEnvironmentsQuery,
  useCreateEnvironmentMutation,
  useDeleteEnvironmentMutation,
} from '@/features/environments/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { EnvironmentName, Environment } from '@/types'

// ─── Config ───────────────────────────────────────────────────────────────────

const ENV_CONFIG: Record<
  EnvironmentName,
  { label: string; badgeVariant: 'default' | 'warning' | 'danger'; defaultDisplayName: string }
> = {
  dev:   { label: 'Development', badgeVariant: 'default',  defaultDisplayName: 'Development' },
  stage: { label: 'Staging',     badgeVariant: 'warning',  defaultDisplayName: 'Staging' },
  prod:  { label: 'Production',  badgeVariant: 'danger',   defaultDisplayName: 'Production' },
}

// ─── Create dialog ────────────────────────────────────────────────────────────

function CreateEnvDialog({
  projectId,
  name,
  onClose,
}: {
  projectId: string
  name: EnvironmentName
  onClose: () => void
}) {
  const config = ENV_CONFIG[name]
  const [displayName, setDisplayName] = React.useState(config.defaultDisplayName)
  const { mutate: createEnv, isPending } = useCreateEnvironmentMutation()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createEnv(
      { projectId, name, displayName },
      {
        onSuccess: () => {
          toast.success(`${displayName} environment created`)
          onClose()
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to create environment'),
      },
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add {config.label} Environment</DialogTitle>
          <DialogDescription>
            Set a display name for this environment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={config.defaultDisplayName}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!displayName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteEnvDialog({
  env,
  onClose,
}: {
  env: Environment
  onClose: () => void
}) {
  const { mutate: deleteEnv, isPending } = useDeleteEnvironmentMutation()

  const onConfirm = () => {
    deleteEnv(env.id, {
      onSuccess: () => {
        toast.success(`${env.displayName} environment deleted`)
        onClose()
      },
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to delete environment'),
    })
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
            Delete Environment
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{' '}
            <span className="font-medium text-fg">{env.displayName}</span> and all its
            deployments, env vars, and domains. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={isPending} onClick={onConfirm}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectEnvironmentsPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: environments = [] } = useEnvironmentsQuery(id)
  const [creating, setCreating] = React.useState<EnvironmentName | null>(null)
  const [deleting, setDeleting] = React.useState<Environment | null>(null)

  return (
    <>
      <div className="max-w-2xl space-y-3">
        {(['dev', 'stage', 'prod'] as EnvironmentName[]).map((name) => {
          const config = ENV_CONFIG[name]
          const existing = environments.find((e) => e.name === name)

          return (
            <div
              key={name}
              className="bg-bg-1 border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Badge variant={config.badgeVariant}>{config.label}</Badge>
                {existing ? (
                  <span className="text-sm text-fg">{existing.displayName}</span>
                ) : (
                  <span className="text-sm text-fg-subtle">Not configured</span>
                )}
              </div>
              {existing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:text-danger"
                  onClick={() => setDeleting(existing)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreating(name)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {creating && (
        <CreateEnvDialog
          projectId={id}
          name={creating}
          onClose={() => setCreating(null)}
        />
      )}
      {deleting && (
        <DeleteEnvDialog
          env={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  )
}
