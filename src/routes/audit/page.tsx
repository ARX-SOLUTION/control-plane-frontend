import * as React from 'react'
import { Info, Clock, Database } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export default function AuditPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Audit Log</h1>
          <p className="text-sm text-fg-muted">
            Track admin actions and system events
          </p>
        </div>
      </div>

      {/* Info card */}
      <Alert variant="info" icon={<Info className="h-4 w-4" />} className="mb-6">
        <AlertTitle>Audit Log Viewer</AlertTitle>
        <AlertDescription>
          Audit events are stored in a separate database table. The API endpoint
          and viewer are not yet implemented.
        </AlertDescription>
      </Alert>

      {/* Coming soon card */}
      <div className="bg-bg-1 border border-border rounded-lg p-8 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-2 mb-4">
          <Clock className="h-6 w-6 text-fg-muted" />
        </div>
        <h2 className="text-base font-semibold text-fg mb-2">Coming Soon</h2>
        <p className="text-sm text-fg-muted mb-4">
          The audit log viewer will display a chronological record of all admin
          actions including project creation, deployments triggered, settings
          changes, and access events.
        </p>
        <div className="space-y-2 text-left">
          <p className="text-xs text-fg-subtle font-medium uppercase tracking-wide mb-2">
            Planned features
          </p>
          {[
            'Filterable by user, action type, and time range',
            'Full JSON payload inspection for each event',
            'Export to CSV',
            'Webhook notifications for critical events',
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-xs text-fg-muted">
              <span className="text-fg-subtle mt-0.5">•</span>
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-bg-1 border border-border rounded-lg p-4 flex items-start gap-3">
        <Database className="h-4 w-4 text-fg-muted mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-fg">Implementation Notes</p>
          <p className="text-xs text-fg-muted mt-1">
            Implement a <code className="font-mono">GET /audit</code> endpoint that reads from
            the <code className="font-mono">audit_log</code> table with pagination and filtering.
            Audit events should be emitted from middleware on all mutating API calls.
          </p>
        </div>
      </div>
    </div>
  )
}
