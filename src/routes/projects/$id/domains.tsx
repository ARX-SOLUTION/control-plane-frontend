import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Trash2, ShieldCheck, ShieldOff } from 'lucide-react'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import {
  useDomainsQuery,
  useCreateDomainMutation,
  useDeleteDomainMutation,
} from '@/features/domains/hooks'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Domain } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// ─── Add Domain Sheet ─────────────────────────────────────────────────────────

function AddDomainSheet({
  open,
  environmentId,
  onClose,
}: {
  open: boolean
  environmentId: string
  onClose: () => void
}) {
  const [domain, setDomain] = React.useState('')
  const [zoneId, setZoneId] = React.useState('')
  const [serverIp, setServerIp] = React.useState('')

  const { mutate: createDomain, isPending } = useCreateDomainMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
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
          setDomain('')
          setZoneId('')
          setServerIp('')
          onClose()
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to add domain'),
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Domain</SheetTitle>
          <SheetDescription>
            Add a custom domain to this environment
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              placeholder="app.example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zoneId">Cloudflare Zone ID</Label>
            <Input
              id="zoneId"
              placeholder="abc123def456..."
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-fg-subtle">Optional — required for DNS automation</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="serverIp">Server IP</Label>
            <Input
              id="serverIp"
              placeholder="1.2.3.4"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-fg-subtle">Optional — for DNS record creation</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!domain.trim()} className="flex-1">
              Add Domain
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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
          <DialogTitle>Remove Domain</DialogTitle>
          <DialogDescription>
            Remove <span className="font-medium text-fg">{domain}</span> from this
            environment? This cannot be undone.
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

export default function DomainsPage() {
  const { id } = useParams({ strict: false }) as { id: string }

  const { data: environments = [], isLoading: envsLoading } = useEnvironmentsQuery(id)
  const [selectedEnvId, setSelectedEnvId] = React.useState<string>('')

  React.useEffect(() => {
    if (!selectedEnvId && environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    }
  }, [environments, selectedEnvId])

  const { data: domains = [], isLoading } = useDomainsQuery(selectedEnvId)
  const { mutate: deleteDomain, isPending: deleting } = useDeleteDomainMutation()

  const [addSheetOpen, setAddSheetOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Domain | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteDomain(
      { id: deleteTarget.id, environmentId: selectedEnvId },
      {
        onSuccess: () => {
          toast.success('Domain removed')
          setDeleteTarget(null)
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to remove domain'),
      }
    )
  }

  const columns = React.useMemo<ColumnDef<Domain, unknown>[]>(
    () => [
      {
        accessorKey: 'domain',
        header: 'Domain',
        cell: ({ row }) => (
          <span className="font-medium text-fg">{row.original.domain}</span>
        ),
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
        accessorKey: 'cloudflareRecordId',
        header: 'CF Record',
        cell: ({ row }) =>
          row.original.cloudflareRecordId ? (
            <code className="text-xs font-mono text-fg-muted">
              {row.original.cloudflareRecordId.slice(0, 12)}…
            </code>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-xs text-fg-muted">
            {formatRelativeTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
            className="text-danger hover:text-danger"
            aria-label="Remove domain"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-fg">Domains</h1>
            <p className="text-sm text-fg-muted">Custom domains for this project</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Label className="text-sm text-fg-muted shrink-0">Env:</Label>
            {envsLoading ? (
              <Skeleton className="h-9 w-28" />
            ) : (
              <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
                <SelectTrigger className="w-28">
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
        <Button
          onClick={() => setAddSheetOpen(true)}
          disabled={!selectedEnvId}
        >
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={domains}
        isLoading={isLoading}
        emptyMessage="No domains configured. Add your first domain."
      />

      {selectedEnvId && (
        <AddDomainSheet
          open={addSheetOpen}
          environmentId={selectedEnvId}
          onClose={() => setAddSheetOpen(false)}
        />
      )}

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
