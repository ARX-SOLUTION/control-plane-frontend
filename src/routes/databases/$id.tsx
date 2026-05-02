import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Copy, Check, Database } from 'lucide-react'
import { useDatabaseQuery, useGetConnectionStringMutation } from '@/features/databases/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { formatAbsoluteTime } from '@/lib/utils'

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

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border last:border-0">
      <span className="text-xs text-fg-muted w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-fg break-all">{children}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatabaseDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: db, isLoading } = useDatabaseQuery(id)
  const { mutate: getConnectionString, isPending } = useGetConnectionStringMutation()

  const [connectionData, setConnectionData] = React.useState<{
    dbName: string
    connectionString: string
  } | null>(null)

  const handleGetConnectionString = () => {
    if (!db) return
    getConnectionString(db.id, {
      onSuccess: (data) =>
        setConnectionData({ dbName: db.name, connectionString: data.connectionString }),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : 'Failed to get connection string'),
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-xl space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!db) {
    return (
      <p className="text-sm text-fg-muted text-center py-12">Database not found.</p>
    )
  }

  return (
    <>
      <div className="max-w-xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <code className="text-xl font-bold font-mono text-fg">{db.name}</code>
            <Badge variant={db.type === 'postgres' ? 'info' : 'warning'}>
              {db.type === 'postgres' ? 'PostgreSQL' : 'Redis'}
            </Badge>
            <Badge variant={db.isActive ? 'success' : 'default'}>
              {db.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button onClick={handleGetConnectionString} loading={isPending}>
            <Database className="h-4 w-4" />
            Get Connection String
          </Button>
        </div>

        {/* ── Details ── */}
        <div className="bg-bg-1 border border-border rounded-lg p-4">
          <h2 className="text-sm font-medium text-fg mb-3">Details</h2>
          <div>
            <DetailRow label="Name">
              <code className="font-mono text-xs">{db.name}</code>
            </DetailRow>
            <DetailRow label="Type">
              {db.type === 'postgres' ? 'PostgreSQL' : 'Redis'}
            </DetailRow>
            {db.host && (
              <DetailRow label="Host">
                <code className="font-mono text-xs">{db.host}</code>
              </DetailRow>
            )}
            {db.port && (
              <DetailRow label="Port">
                <code className="font-mono text-xs">{db.port}</code>
              </DetailRow>
            )}
            {db.databaseName && (
              <DetailRow label="Database">
                <code className="font-mono text-xs">{db.databaseName}</code>
              </DetailRow>
            )}
            {db.username && (
              <DetailRow label="Username">
                <code className="font-mono text-xs">{db.username}</code>
              </DetailRow>
            )}
            {db.containerName && (
              <DetailRow label="Container">
                <code className="font-mono text-xs">{db.containerName}</code>
              </DetailRow>
            )}
            <DetailRow label="Project">
              <code className="font-mono text-xs text-accent">{db.projectId}</code>
            </DetailRow>
            <DetailRow label="Created">
              {formatAbsoluteTime(db.createdAt)}
            </DetailRow>
          </div>
        </div>
      </div>

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
