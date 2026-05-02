import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Eye, Copy, Plus, Trash2, Check } from 'lucide-react'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import {
  useEnvVarsQuery,
  useCreateEnvVarMutation,
  useUpdateEnvVarMutation,
  useDeleteEnvVarMutation,
  useRevealEnvVarMutation,
} from '@/features/env-vars/hooks'
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
import type { EnvVar } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// ─── Reveal dialog ────────────────────────────────────────────────────────────

function RevealDialog({
  value,
  envKey,
  onClose,
}: {
  value: string
  envKey: string
  onClose: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const [secondsLeft, setSecondsLeft] = React.useState(30)

  // Auto-close after 30s
  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { onClose(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onClose])

  const copyValue = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Secret Value</DialogTitle>
          <DialogDescription>
            Auto-closes in{' '}
            <span className="font-medium text-fg">{secondsLeft}s</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs font-mono text-fg-muted">{envKey}</p>
          <div className="relative">
            <pre className="bg-bg-0 border border-border rounded-md p-3 text-sm font-mono break-all whitespace-pre-wrap text-fg">
              {value}
            </pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" onClick={copyValue}>
            {copied ? (
              <><Check className="h-3.5 w-3.5" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  envKey,
  onConfirm,
  onClose,
  isPending,
}: {
  envKey: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Variable</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <code className="font-mono text-sm">{envKey}</code>? This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={isPending} onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Table row ────────────────────────────────────────────────────────────────

function EnvVarRow({
  envVar,
  onReveal,
  onToggleActive,
  onDelete,
}: {
  envVar: EnvVar
  onReveal: (id: string) => void
  onToggleActive: (id: string, current: boolean) => void
  onDelete: (envVar: EnvVar) => void
}) {
  return (
    <tr className="border-b border-border hover:bg-bg-2 transition-colors">
      <td className="px-4 py-2.5">
        <code className="text-sm font-mono text-fg">{envVar.key}</code>
      </td>
      <td className="px-4 py-2.5 text-sm text-fg-muted">v{envVar.version}</td>
      <td className="px-4 py-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={envVar.isActive}
          onClick={() => onToggleActive(envVar.id, envVar.isActive)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
            envVar.isActive ? 'bg-accent' : 'bg-fg-subtle/30'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              envVar.isActive ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </td>
      <td className="px-4 py-2.5 text-xs text-fg-subtle">
        {formatRelativeTime(envVar.createdAt)}
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReveal(envVar.id)}
            aria-label="Reveal value"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(envVar)}
            aria-label="Delete variable"
            className="text-danger hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EnvVarsPage() {
  const { id } = useParams({ strict: false }) as { id: string }

  const { data: environments = [], isLoading: envsLoading } = useEnvironmentsQuery(id)
  const [selectedEnvId, setSelectedEnvId] = React.useState<string>('')

  // Set default environment once loaded
  React.useEffect(() => {
    if (!selectedEnvId && environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    }
  }, [environments, selectedEnvId])

  const { data: envVars = [], isLoading: varsLoading } = useEnvVarsQuery(selectedEnvId)

  const { mutate: createEnvVar, isPending: creating } = useCreateEnvVarMutation()
  const { mutate: updateEnvVar } = useUpdateEnvVarMutation()
  const { mutate: deleteEnvVar, isPending: deleting } = useDeleteEnvVarMutation()
  const { mutate: revealEnvVar, isPending: revealing } = useRevealEnvVarMutation()

  // New var form state
  const [newKey, setNewKey] = React.useState('')
  const [newValue, setNewValue] = React.useState('')

  // Reveal dialog state
  const [revealData, setRevealData] = React.useState<{ envKey: string; value: string } | null>(null)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = React.useState<EnvVar | null>(null)

  const handleReveal = (id: string) => {
    const envVar = envVars.find((v) => v.id === id)
    if (!envVar) return
    revealEnvVar(id, {
      onSuccess: (data) => {
        setRevealData({ envKey: envVar.key, value: data.value })
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Failed to reveal value')
      },
    })
  }

  const handleToggleActive = (id: string, current: boolean) => {
    updateEnvVar(
      { id, data: { isActive: !current } },
      {
        onSuccess: () => toast.success(current ? 'Variable disabled' : 'Variable enabled'),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to update variable'),
      }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteEnvVar(
      { id: deleteTarget.id, environmentId: selectedEnvId },
      {
        onSuccess: () => {
          toast.success('Variable deleted')
          setDeleteTarget(null)
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to delete variable'),
      }
    )
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKey.trim() || !newValue.trim() || !selectedEnvId) return
    createEnvVar(
      { environmentId: selectedEnvId, key: newKey.trim(), value: newValue.trim() },
      {
        onSuccess: () => {
          toast.success(`Variable ${newKey} created`)
          setNewKey('')
          setNewValue('')
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to create variable'),
      }
    )
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Environment Variables</h1>
          <p className="text-sm text-fg-muted">Manage secrets and configuration per environment</p>
        </div>
        {/* Environment picker */}
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Environment:</Label>
          {envsLoading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {environments.map((env) => (
                  <SelectItem key={env.id} value={env.id}>
                    {env.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ── No environment selected ── */}
      {!selectedEnvId && !envsLoading && (
        <div className="text-center py-12 text-fg-muted">
          <p className="text-sm">No environments found for this project.</p>
        </div>
      )}

      {/* ── Table ── */}
      {selectedEnvId && (
        <div className="bg-bg-1 border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-2 border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fg-muted">Key</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fg-muted">Version</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fg-muted">Active</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fg-muted">Created</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-fg-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {varsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-2.5">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : envVars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-fg-muted">
                    No variables yet. Add one below.
                  </td>
                </tr>
              ) : (
                envVars.map((envVar) => (
                  <EnvVarRow
                    key={envVar.id}
                    envVar={envVar}
                    onReveal={handleReveal}
                    onToggleActive={handleToggleActive}
                    onDelete={setDeleteTarget}
                  />
                ))
              )}

              {/* ── Add row ── */}
              <tr className="bg-bg-0 border-t-2 border-border">
                <td colSpan={5} className="px-4 py-3">
                  <form onSubmit={handleAdd} className="flex items-center gap-2">
                    <Input
                      placeholder="KEY"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                      className="font-mono text-sm flex-1"
                      aria-label="New variable key"
                    />
                    <Input
                      placeholder="value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="font-mono text-sm flex-1"
                      type="password"
                      aria-label="New variable value"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      loading={creating}
                      disabled={!newKey.trim() || !newValue.trim()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Dialogs ── */}
      {revealData && (
        <RevealDialog
          value={revealData.value}
          envKey={revealData.envKey}
          onClose={() => setRevealData(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmDialog
          envKey={deleteTarget.key}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isPending={deleting}
        />
      )}

      {/* Loading overlay for reveal */}
      {revealing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="bg-bg-1 border border-border rounded-lg px-6 py-4 text-sm text-fg-muted">
            Revealing secret…
          </div>
        </div>
      )}
    </>
  )
}
