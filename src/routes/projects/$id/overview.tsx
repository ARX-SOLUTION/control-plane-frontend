import * as React from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ExternalLink, GitBranch, Rocket, ChevronRight } from 'lucide-react'
import { useProjectQuery } from '@/features/projects/hooks'
import { useEnvironmentsQuery } from '@/features/environments/hooks'
import { useDeploymentsQuery, useCreateDeploymentMutation } from '@/features/deployments/hooks'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Environment } from '@/types'
import { formatRelativeTime, formatAbsoluteTime } from '@/lib/utils'

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border last:border-0">
      <span className="text-xs text-fg-muted w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-fg break-all">{children}</span>
    </div>
  )
}

// ─── Deploy dialog ────────────────────────────────────────────────────────────

function DeployDialog({
  open,
  environments,
  onClose,
  onDeploy,
  isPending,
}: {
  open: boolean
  environments: Environment[]
  onClose: () => void
  onDeploy: (environmentId: string) => void
  isPending: boolean
}) {
  const [selectedEnvId, setSelectedEnvId] = React.useState<string>(
    environments[0]?.id ?? ''
  )

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Deploy to Environment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-fg-muted">Select the environment to deploy to:</p>
          <Select value={selectedEnvId} onValueChange={setSelectedEnvId}>
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              {environments.map((env) => (
                <SelectItem key={env.id} value={env.id}>
                  {env.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={isPending}
            disabled={!selectedEnvId}
            onClick={() => onDeploy(selectedEnvId)}
          >
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectOverviewPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: project, isLoading: projectLoading } = useProjectQuery(id)
  const { data: environments = [] } = useEnvironmentsQuery(id)

  // Use the last (likely prod) environment for the latest deployment
  const latestEnv = environments[environments.length - 1]
  const { data: deployments } = useDeploymentsQuery(latestEnv?.id)
  const latestDeployment = deployments?.[0]

  const { mutate: createDeployment, isPending: deploying } = useCreateDeploymentMutation()
  const [deployDialogOpen, setDeployDialogOpen] = React.useState(false)

  const handleDeploy = (environmentId: string) => {
    createDeployment(
      { environmentId, branch: project?.branch ?? undefined },
      {
        onSuccess: () => {
          toast.success('Deployment started')
          setDeployDialogOpen(false)
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Failed to start deployment')
        },
      }
    )
  }

  const onDeployClick = () => {
    if (environments.length === 1) {
      handleDeploy(environments[0].id)
    } else {
      setDeployDialogOpen(true)
    }
  }

  if (projectLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    )
  }

  if (!project) return null

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: project details ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-1 border border-border rounded-lg p-4">
            <h2 className="text-sm font-medium text-fg mb-3">Project Details</h2>
            <div>
              <DetailRow label="Display Name">{project.displayName}</DetailRow>
              <DetailRow label="Slug">
                <code className="font-mono text-xs bg-bg-2 px-1.5 py-0.5 rounded">
                  {project.name}
                </code>
              </DetailRow>
              {project.githubUrl && (
                <DetailRow label="GitHub">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {project.githubUrl.replace('https://github.com/', '')}
                  </a>
                </DetailRow>
              )}
              <DetailRow label="Branch">
                {project.branch ? (
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5 text-fg-muted" />
                    <code className="font-mono text-xs">{project.branch}</code>
                  </span>
                ) : (
                  <span className="text-fg-subtle">—</span>
                )}
              </DetailRow>
              {project.buildCommand && (
                <DetailRow label="Build Command">
                  <code className="font-mono text-xs">{project.buildCommand}</code>
                </DetailRow>
              )}
              {project.startCommand && (
                <DetailRow label="Start Command">
                  <code className="font-mono text-xs">{project.startCommand}</code>
                </DetailRow>
              )}
              <DetailRow label="App Port">
                <code className="font-mono text-xs">{project.appPort}</code>
              </DetailRow>
              <DetailRow label="Health Check">
                <code className="font-mono text-xs">{project.healthCheckPath ?? '/'}</code>
              </DetailRow>
              <DetailRow label="Created">
                {formatAbsoluteTime(project.createdAt)}
              </DetailRow>
            </div>
          </div>

          {/* Environments section */}
          {environments.length > 0 && (
            <div className="bg-bg-1 border border-border rounded-lg p-4">
              <h2 className="text-sm font-medium text-fg mb-3">Environments</h2>
              <div className="space-y-2">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          env.name === 'prod'
                            ? 'danger'
                            : env.name === 'stage'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {env.displayName}
                      </Badge>
                      <span className="text-xs text-fg-subtle font-mono">{env.name}</span>
                    </div>
                    <Link
                      to="/projects/$id/deployments"
                      params={{ id }}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-0.5"
                    >
                      View deployments
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: latest deployment + actions ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-bg-1 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-fg">Latest Deployment</h2>
              {latestEnv && (
                <Badge variant="default" className="text-xs">
                  {latestEnv.displayName}
                </Badge>
              )}
            </div>

            {latestDeployment ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-fg-muted">
                    {latestDeployment.id.slice(0, 12)}
                  </code>
                  <StatusBadge status={latestDeployment.status} />
                </div>
                {latestDeployment.commitHash && (
                  <p className="text-xs text-fg-muted font-mono">
                    {latestDeployment.commitHash.slice(0, 7)}
                    {latestDeployment.commitMessage && (
                      <span className="font-sans ml-2 text-fg-subtle">
                        {latestDeployment.commitMessage.slice(0, 60)}
                      </span>
                    )}
                  </p>
                )}
                {latestDeployment.startedAt && (
                  <p className="text-xs text-fg-subtle">
                    {formatRelativeTime(latestDeployment.startedAt)}
                  </p>
                )}
                <Link
                  to="/projects/$id/deployments/$depId"
                  params={{ id, depId: latestDeployment.id }}
                  className="text-xs text-accent hover:underline"
                >
                  View details →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-fg-muted">No deployments yet.</p>
            )}
          </div>

          {/* Deploy action */}
          <Button
            className="w-full"
            onClick={onDeployClick}
            loading={deploying}
            disabled={environments.length === 0}
          >
            <Rocket className="h-4 w-4" />
            Deploy Now
          </Button>
          {environments.length === 0 && (
            <p className="text-xs text-fg-subtle text-center">
              No environments configured yet.
            </p>
          )}
        </div>
      </div>

      {/* Deploy dialog (multi-env) */}
      {environments.length > 1 && (
        <DeployDialog
          open={deployDialogOpen}
          environments={environments}
          onClose={() => setDeployDialogOpen(false)}
          onDeploy={handleDeploy}
          isPending={deploying}
        />
      )}
    </>
  )
}
