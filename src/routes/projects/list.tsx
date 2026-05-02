import * as React from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink, ChevronRight } from 'lucide-react'
import { useProjectsQuery } from '@/features/projects/hooks'
import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjectsQuery()

  const columns = React.useMemo<ColumnDef<Project, unknown>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <Link
              to="/projects/$id"
              params={{ id: row.original.id }}
              className="font-medium text-fg hover:text-accent transition-colors"
            >
              {row.original.displayName}
            </Link>
            <p className="text-xs text-fg-subtle font-mono mt-0.5">{row.original.name}</p>
          </div>
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
        accessorKey: 'githubUrl',
        header: 'GitHub',
        cell: ({ row }) =>
          row.original.githubUrl ? (
            <a
              href={row.original.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">
                {row.original.githubUrl.replace('https://github.com/', '')}
              </span>
            </a>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        accessorKey: 'branch',
        header: 'Branch',
        cell: ({ row }) =>
          row.original.branch ? (
            <code className="text-xs bg-bg-2 px-1.5 py-0.5 rounded font-mono">
              {row.original.branch}
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
        id: 'navigate',
        header: '',
        cell: ({ row }) => (
          <button
            onClick={() =>
              navigate({ to: '/projects/$id', params: { id: row.original.id } })
            }
            className="p-1 rounded hover:bg-bg-3 text-fg-subtle hover:text-fg transition-colors"
            aria-label={`View ${row.original.displayName}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [navigate]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Projects</h1>
          <p className="text-sm text-fg-muted">Manage your deployed applications</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/projects/new' })}>
            New Project
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={projects ?? []}
        isLoading={isLoading}
        emptyMessage="No projects yet. Create your first project."
      />
    </div>
  )
}
