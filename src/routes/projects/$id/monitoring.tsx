import * as React from 'react'
import { useParams } from '@tanstack/react-router'
import { Info } from 'lucide-react'
import { useGrafanaConfig } from '@/features/monitoring/hooks'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectMonitoringPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: config, isLoading } = useGrafanaConfig()

  const grafanaUrl = (config as { url?: string } | undefined)?.url

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full rounded-lg" />
  }

  if (!grafanaUrl) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-fg">Monitoring</h1>
          <p className="text-sm text-fg-muted">Grafana metrics dashboard</p>
        </div>
        <Alert variant="info" icon={<Info className="h-4 w-4" />}>
          <AlertTitle>Grafana Not Configured</AlertTitle>
          <AlertDescription>
            Set the <code className="font-mono text-xs">GRAFANA_URL</code> environment
            variable on the Control Plane server to enable embedded metrics dashboards.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Build the embedded Grafana URL for this project's dashboard
  const embedUrl = `${grafanaUrl}/d/project-overview/project-overview?orgId=1&var-project=${id}&kiosk=tv`

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-fg">Monitoring</h1>
        <p className="text-sm text-fg-muted">
          Grafana metrics for this project —{' '}
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline text-xs"
          >
            Open in Grafana ↗
          </a>
        </p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden bg-bg-0">
        <iframe
          src={embedUrl}
          className="w-full"
          style={{ height: '600px', border: 'none' }}
          title={`Grafana metrics for project ${id}`}
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
