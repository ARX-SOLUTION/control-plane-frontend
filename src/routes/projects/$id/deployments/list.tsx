import * as React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Rocket, ChevronRight } from 'lucide-react'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import {
  useDeploymentsQuery,
  useCreateDeploymentMutation,
} from '@/features/deployments/hooks'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Deployment, DeploymentStatus } from '@/types'
import { formatRelativeTime, formatDuration } from '@/lib/utils'

// ─── Active statuses ──────────────────────────────────────────────────────────

const ACTIVE_STATUSES: DeploymentStatus[] = [
  'pending',
  'cloning',
  'building',
  'starting',
  'health_check',
  'switching',
]

// ─── Duration helper ──────────────────────────────────────────────────────────

function deploymentDuration(dep: Deployment): string | null {
  if (!dep.startedAt) return null
  const end = dep.completedAt ? new Date(dep.completedAt) : new Date()
  const ms = end.getTime() - new Date(dep.startedAt).getTime()
  return formatDuration(ms)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeploymentsListPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()

  const { data: environments = [], isLoading: envsLoading } = useEnvironmentsQuery(id)
  const [selectedEnvId, setSelectedEnvId] = React.useState<string>('')

  // Set default environment once loaded
  React.useEffect(() => {
    if (!selectedEnvId && environments.length > 0) {
      setSelectedEnvId(environments[0].id)
    }
  }, [environments, selectedEnvId])

  // Polling: track if any deployment is active
  const [refetchInterval, setRefetchInterval] = React.useState<number | false>(false)
  const { data: deployments = [], isLoading } = useDeploymentsQuery(selectedEnvId, {
    refetchInterval,
  })

  React.useEffect(() => {
    const hasActive = deployments.some((d) => ACTIVE_STATUSES.includes(d.status))
    setRefetchInterval(hasActive ? 3000 : false)
  }, [deployments])

  const { mutate: createDeployment, isPending: deploying } = useCreateDeploymentMutation()

  const handleDeploy = () => {
    if (!selectedEnvId) return
    createDeployment(
      { environmentId: selectedEnvId },
      {
        onSuccess: () => toast.success('Deployment started'),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : 'Failed to start deployment'),
      }
    )
  }

  const columns = React.useMemo<ColumnDef<Deployment, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <code className="text-xs font-mono text-fg-muted">
            {row.original.id.slice(0, 8)}
          </code>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'branch',
        header: 'Branch',
        cell: ({ row }) =>
          row.original.branch ? (
            <code className="text-xs font-mono bg-bg-2 px-1.5 py-0.5 rounded">
              {row.original.branch}
            </code>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        accessorKey: 'commitHash',
        header: 'Commit',
        cell: ({ row }) =>
          row.original.commitHash ? (
            <div>
              <code className="text-xs font-mono text-fg-muted">
                {row.original.commitHash.slice(0, 7)}
              </code>
              {row.original.commitMessage && (
                <p className="text-xs text-fg-subtle truncate max-w-[200px] mt-0.5">
                  {row.original.commitMessage}
                </p>
              )}
            </div>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        accessorKey: 'startedAt',
        header: 'Started',
        cell: ({ row }) =>
          row.original.startedAt ? (
            <span className="text-xs text-fg-muted">
              {formatRelativeTime(row.original.startedAt)}
            </span>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const dur = deploymentDuration(row.original)
          return dur ? (
            <span className="text-xs text-fg-muted tabular-nums">{dur}</span>
          ) : (
            <span className="text-fg-subtle">—</span>
          )
        },
      },
      {
        id: 'navigate',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() =>
              navigate({
                to: '/projects/$id/deployments/$depId',
                params: { id, depId: row.original.id },
              })
            }
            className="p-1 rounded hover:bg-bg-3 text-fg-subtle hover:text-fg transition-colors"
            aria-label="View deployment"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [id, navigate]
  )

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-fg">Deployments</h1>
            <p className="text-sm text-fg-muted">Deployment history</p>
          </div>
          {/* Environment picker */}
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
        <Button onClick={handleDeploy} loading={deploying} disabled={!selectedEnvId}>
          <Rocket className="h-4 w-4" />
          Deploy
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={deployments}
        isLoading={isLoading}
        emptyMessage="No deployments yet. Click Deploy to start."
      />
    </div>
  )
}
