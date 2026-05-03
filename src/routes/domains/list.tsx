import * as React from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Trash2, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react'
import { useDomainsQuery, useCreateDomainMutation, useDeleteDomainMutation } from '@/features/domains/hooks'
import { useProjectsQuery } from '@/features/projects/hooks'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import { DataTable } from '@/components/data-table'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Domain, Environment } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// ─── Add domain dialog ────────────────────────────────────────────────────────

function AddDomainDialog({ onClose }: { onClose: () => void }) {
  const [projectId, setProjectId] = React.useState('')
  const [environmentId, setEnvironmentId] = React.useState('')
  const [domain, setDomain] = React.useState('')
  const [zoneId, setZoneId] = React.useState('')
  const [serverIp, setServerIp] = React.useState('')

  const { data: projects = [] } = useProjectsQuery()
  const { data: environments = [] } = useEnvironmentsQuery(projectId || undefined)
  const { mutate: createDomain, isPending } = useCreateDomainMutation()

  React.useEffect(() => {
    setEnvironmentId('')
  }, [projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!environmentId || !domain.trim()) return
    createDomain(
      {
        environmentId,
        domain: domain.trim(),
        cloudflareZoneId: zoneId.trim() || undefined,
        serverIp: serverIp.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Domain added')
          onClose()
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to add domain'),
      },
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogDescription>
            Attach a custom domain to a project environment. Caddy route and TLS are managed automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Environment</Label>
            <Select value={environmentId} onValueChange={setEnvironmentId} disabled={!projectId}>
              <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
              <SelectContent>
                {environments.map((e: Environment) => (
                  <SelectItem key={e.id} value={e.id}>{e.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Domain *</Label>
            <Input
              placeholder="app.example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cloudflare Zone ID</Label>
            <Input
              placeholder="abc123..."
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-fg-subtle">Optional — for automatic DNS record</p>
          </div>
          <div className="space-y-1.5">
            <Label>Server IP</Label>
            <Input
              placeholder="1.2.3.4"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-fg-subtle">Optional — creates DNS A record in Cloudflare</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isPending} disabled={!environmentId || !domain.trim()}>
              Add Domain
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteDomainDialog({
  domain,
  onConfirm,
  onClose,
  isPending,
}: {
  domain: string
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="h-4 w-4" />
            Remove Domain
          </DialogTitle>
          <DialogDescription>
            Remove <span className="font-medium text-fg">{domain}</span>? The Caddy route and DNS record will be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={isPending} onClick={onConfirm}>Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllDomainsPage() {
  const { data: domains = [], isLoading } = useDomainsQuery()
  const { data: projects = [] } = useProjectsQuery()
  const { data: allEnvs = [] } = useEnvironmentsQuery()
  const { mutate: deleteDomain, isPending: deleting } = useDeleteDomainMutation()

  const [addOpen, setAddOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Domain | null>(null)

  const projectMap = React.useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])
  const envMap = React.useMemo(() => new Map(allEnvs.map((e) => [e.id, e])), [allEnvs])

  const handleDelete = () => {
    if (!deleteTarget) return
    const env = envMap.get(deleteTarget.environmentId)
    deleteDomain(
      { id: deleteTarget.id, environmentId: deleteTarget.environmentId },
      {
        onSuccess: () => {
          toast.success('Domain removed')
          setDeleteTarget(null)
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to remove domain'),
      },
    )
  }

  const columns = React.useMemo<ColumnDef<Domain, unknown>[]>(
    () => [
      {
        accessorKey: 'domain',
        header: 'Domain',
        cell: ({ row }) => (
          <a
            href={`https://${row.original.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-fg hover:text-accent hover:underline"
          >
            {row.original.domain}
          </a>
        ),
      },
      {
        accessorKey: 'environmentId',
        header: 'Project / Environment',
        cell: ({ row }) => {
          const env = envMap.get(row.original.environmentId)
          const project = env ? projectMap.get(env.projectId) : undefined
          return (
            <div className="flex items-center gap-1.5">
              {project ? (
                <span className="text-sm text-fg">{project.displayName}</span>
              ) : (
                <code className="text-xs font-mono text-fg-muted">{row.original.environmentId.slice(0, 8)}…</code>
              )}
              {env && (
                <Badge
                  variant={env.name === 'prod' ? 'danger' : env.name === 'stage' ? 'warning' : 'default'}
                >
                  {env.displayName}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'sslEnabled',
        header: 'SSL',
        cell: ({ row }) =>
          row.original.sslEnabled ? (
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
              <ShieldOff className="h-3.5 w-3.5" /> Disabled
            </span>
          ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-fg-muted">{formatRelativeTime(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    [envMap, projectMap],
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Domains</h1>
          <p className="text-sm text-fg-muted">All custom domains across all environments</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={domains}
        isLoading={isLoading}
        emptyMessage="No domains configured yet."
      />

      {addOpen && <AddDomainDialog onClose={() => setAddOpen(false)} />}

      {deleteTarget && (
        <DeleteDomainDialog
          domain={deleteTarget.domain}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isPending={deleting}
        />
      )}
    </>
  )
}
