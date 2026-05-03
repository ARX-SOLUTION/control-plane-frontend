import * as React from 'react'
import { Info } from 'lucide-react'
import { useGrafanaConfig } from '@/features/monitoring/hooks'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export default function GlobalMonitoringPage() {
  const { data: config, isLoading } = useGrafanaConfig()
  const cfg = config as { url?: string; dashboards?: { metrics?: string; deployment?: string } } | undefined
  const grafanaUrl = cfg?.url
  const metricsDashboard = cfg?.dashboards?.metrics

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-fg">Monitoring</h1>
          <p className="text-sm text-fg-muted">Infrastructure metrics</p>
        </div>
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    )
  }

  if (!grafanaUrl) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-fg">Monitoring</h1>
          <p className="text-sm text-fg-muted">Infrastructure metrics dashboard</p>
        </div>
        <Alert variant="info" icon={<Info className="h-4 w-4" />}>
          <AlertTitle>Grafana Not Configured</AlertTitle>
          <AlertDescription>
            <p>
              Set the{' '}
              <code className="font-mono text-xs">GRAFANA_URL</code> environment
              variable on your Control Plane server to enable the embedded Grafana
              dashboard.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Example: <code className="font-mono">GRAFANA_URL=http://grafana:3000</code>
            </p>
          </AlertDescription>
        </Alert>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['CPU Usage', 'Memory', 'Active Deployments'].map((metric) => (
            <div key={metric} className="bg-bg-1 border border-border rounded-lg p-4">
              <p className="text-xs text-fg-muted mb-2">{metric}</p>
              <div className="h-16 bg-bg-2 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const embedUrl = `${grafanaUrl}/d/${metricsDashboard ?? 'rYdddlPWk'}?orgId=1&kiosk=tv`

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-fg">Monitoring</h1>
          <p className="text-sm text-fg-muted">
            Infrastructure overview —{' '}
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline text-xs"
            >
              Open Grafana ↗
            </a>
          </p>
        </div>
      </div>
      <div className="flex-1 rounded-lg border border-border overflow-hidden bg-bg-0">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          style={{ minHeight: '600px', border: 'none' }}
          title="Grafana infrastructure overview"
          allow="fullscreen"
        />
      </div>
    </div>
  )
}
