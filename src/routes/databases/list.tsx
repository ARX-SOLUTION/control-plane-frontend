import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Plus, Copy, Check, Trash2, Database } from 'lucide-react'
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
        <pre className="bg-bg-0 border border-border rounded-md p-3 text-xs font-mono break-all whitespace-pre-wrap text-fg-muted">
          {masked}
        </pre>
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

function ProvisionDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [type, setType] = React.useState<DatabaseType>('postgres')
  const [projectId, setProjectId] = React.useState('')
  const { mutate: createDatabase, isPending } = useCreateDatabaseMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !projectId.trim()) return
    createDatabase(
      { projectId: projectId.trim(), name: name.trim(), type },
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
          <DialogDescription>Create a new managed database</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project ID</Label>
            <Input
              placeholder="proj_..."
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-fg-subtle">
              Or navigate to a project's Databases tab to provision from there.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              placeholder="my-db"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DatabaseType)}>
              <SelectTrigger>
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
            <Button type="submit" loading={isPending} disabled={!name.trim() || !projectId.trim()}>
              Provision
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllDatabasesPage() {
  const navigate = useNavigate()
  const { data: databases = [], isLoading } = useDatabasesQuery()
  const { mutate: getConnectionString } = useGetConnectionStringMutation()

  const [provisionOpen, setProvisionOpen] = React.useState(false)
  const [connectionData, setConnectionData] = React.useState<{
    dbName: string
    connectionString: string
  } | null>(null)

  const handleGetConnectionString = (db: Db) => {
    getConnectionString(db.id, {
      onSuccess: (data) =>
        setConnectionData({ dbName: db.name, connectionString: data.connectionString }),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to get connection string'),
    })
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
        accessorKey: 'projectId',
        header: 'Project',
        cell: ({ row }) => (
          <button
            onClick={() =>
              navigate({ to: '/projects/$id', params: { id: row.original.projectId } })
            }
            className="text-xs text-accent hover:underline font-mono"
          >
            {row.original.projectId.slice(0, 12)}…
          </button>
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleGetConnectionString(row.original)}
          >
            <Database className="h-3.5 w-3.5" />
            Connect
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate]
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Databases</h1>
          <p className="text-sm text-fg-muted">All managed databases across all projects</p>
        </div>
        <Button onClick={() => setProvisionOpen(true)}>
          <Plus className="h-4 w-4" />
          Provision
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={databases}
        isLoading={isLoading}
        emptyMessage="No databases provisioned yet."
      />

      {provisionOpen && (
        <ProvisionDialog onClose={() => setProvisionOpen(false)} />
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
