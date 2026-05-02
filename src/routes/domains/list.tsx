import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useDomainsQuery } from '@/features/domains/hooks'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import type { Domain } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export default function AllDomainsPage() {
  const navigate = useNavigate()
  const { data: domains = [], isLoading } = useDomainsQuery()

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
        accessorKey: 'environmentId',
        header: 'Environment',
        cell: ({ row }) => (
          <code className="text-xs font-mono text-fg-muted">
            {row.original.environmentId.slice(0, 12)}…
          </code>
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
    ],
    []
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Domains</h1>
          <p className="text-sm text-fg-muted">All custom domains across all environments</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={domains}
        isLoading={isLoading}
        emptyMessage="No domains configured yet."
      />
    </div>
  )
}
