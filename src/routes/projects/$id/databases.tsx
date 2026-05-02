import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Trash2, Copy, Check, Database } from 'lucide-react'
import {
  useDatabasesQuery,
  useCreateDatabaseMutation,
  useDeleteDatabaseMutation,
  useGetConnectionStringMutation,
} from '@/features/databases/hooks'
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
import type { Database as Db, DatabaseType } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// ─── Connection string dialog ─────────────────────────────────────────────────

function ConnectionStringDialog({
  dbName,
  connectionString,
  onClose,
}: {
  dbName: string
  connectionString: string
  onClose: () => void
}) {
  const [copied, setCopied] = React.useState(false)
  const [secondsLeft, setSecondsLeft] = React.useState(30)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { onClose(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onClose])

  const copy = async () => {
    await navigator.clipboard.writeText(connectionString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Mask credentials in display
  const masked = connectionString.replace(/:([^:@]+)@/, ':••••••••@')

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Connection String</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{dbName}</span> — auto-closes in{' '}
            <span className="font-medium text-fg">{secondsLeft}s</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <pre className="bg-bg-0 border border-border rounded-md p-3 text-xs font-mono break-all whitespace-pre-wrap text-fg-muted">
            {masked}
          </pre>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={copy}>
            {copied ? (
              <><Check className="h-3.5 w-3.5" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy (full)</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Provision dialog ─────────────────────────────────────────────────────────

function ProvisionDialog({
  projectId,
  onClose,
}: {
  projectId: string
  onClose: () => void
}) {
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState<DatabaseType>('postgres')
  const { mutate: createDatabase, isPending } = useCreateDatabaseMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    createDatabase(
      { projectId, name: name.trim(), type },
      {
        onSuccess: () => {
          toast.success(`Database "${name}" provisioned`)
          onClose()
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to provision database'),
      }
    )
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Provision Database</DialogTitle>
          <DialogDescription>Create a new managed database for this project</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dbName">Name *</Label>
            <Input
              id="dbName"
              placeholder="my-db"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-sm"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dbType">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DatabaseType)}>
              <SelectTrigger id="dbType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={isPending} disabled={!name.trim()}>
              Provision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteDbDialog({
  db,
  onConfirm,
  onClose,
  isPending,
}: {
  db: Db
  onConfirm: () => void
  onClose: () => void
  isPending: boolean
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Database</DialogTitle>
          <DialogDescription>
            Permanently delete <code className="font-mono text-sm">{db.name}</code>? All
            data will be lost and this cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={isPending} onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatabasesPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: databases = [], isLoading } = useDatabasesQuery(id)
  const { mutate: deleteDatabase, isPending: deleting } = useDeleteDatabaseMutation()
  const { mutate: getConnectionString } = useGetConnectionStringMutation()

  const [provisionOpen, setProvisionOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<Db | null>(null)
  const [connectionData, setConnectionData] = React.useState<{
    dbName: string
    connectionString: string
  } | null>(null)

  const handleGetConnectionString = (db: Db) => {
    getConnectionString(db.id, {
      onSuccess: (data) => {
        setConnectionData({ dbName: db.name, connectionString: data.connectionString })
      },
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to get connection string'),
    })
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteDatabase(
      { id: deleteTarget.id, projectId: id },
      {
        onSuccess: () => {
          toast.success('Database deleted')
          setDeleteTarget(null)
        },
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to delete database'),
      }
    )
  }

  const columns = React.useMemo<ColumnDef<Db, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <code className="text-sm font-mono text-fg">{row.original.name}</code>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={row.original.type === 'postgres' ? 'info' : 'warning'}>
            {row.original.type === 'postgres' ? 'PostgreSQL' : 'Redis'}
          </Badge>
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
        accessorKey: 'port',
        header: 'Port',
        cell: ({ row }) =>
          row.original.port ? (
            <code className="text-xs font-mono">{row.original.port}</code>
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
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleGetConnectionString(row.original)}
            >
              <Database className="h-3.5 w-3.5" />
              Connect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row.original)}
              className="text-danger hover:text-danger"
              aria-label="Delete database"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Databases</h1>
          <p className="text-sm text-fg-muted">Managed databases for this project</p>
        </div>
        <Button onClick={() => setProvisionOpen(true)}>
          <Plus className="h-4 w-4" />
          Provision Database
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={databases}
        isLoading={isLoading}
        emptyMessage="No databases provisioned yet."
      />

      {provisionOpen && (
        <ProvisionDialog
          projectId={id}
          onClose={() => setProvisionOpen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteDbDialog
          db={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          isPending={deleting}
        />
      )}

      {connectionData && (
        <ConnectionStringDialog
          dbName={connectionData.dbName}
          connectionString={connectionData.connectionString}
          onClose={() => setConnectionData(null)}
        />
      )}
    </>
  )
}
