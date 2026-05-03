import * as React from 'react'
import { Link, Outlet, useParams, useLocation } from '@tanstack/react-router'
import { useProjectQuery } from '@/features/projects/hooks'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ─── Tab definition ───────────────────────────────────────────────────────────

const TABS = [
  { label: 'Overview',      segment: 'overview'      },
  { label: 'Environments',  segment: 'environments'  },
  { label: 'Env Vars',      segment: 'env-vars'      },
  { label: 'Deployments', segment: 'deployments' },
  { label: 'Domains',     segment: 'domains'     },
  { label: 'Databases',   segment: 'databases'   },
  { label: 'Logs',        segment: 'logs'        },
  { label: 'Monitoring',  segment: 'monitoring'  },
  { label: 'Settings',    segment: 'settings'    },
] as const

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function ProjectLayout() {
  const { id } = useParams({ strict: false }) as { id: string }
  const { data: project, isLoading } = useProjectQuery(id)
  const { pathname } = useLocation()

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-fg-muted mb-3" aria-label="Breadcrumb">
        <Link to="/projects" className="hover:text-fg transition-colors">
          Projects
        </Link>
        <span className="mx-1.5">/</span>
        {isLoading ? (
          <Skeleton className="inline-block w-24 h-3.5 align-middle" />
        ) : (
          <span className="text-fg">{project?.displayName ?? id}</span>
        )}
      </nav>

      {/* ── Project header ── */}
      <div className="flex items-center gap-3 mb-5">
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <>
            <h1 className="text-2xl font-bold text-fg">
              {project?.displayName ?? '—'}
            </h1>
            {project && (
              <Badge variant={project.isActive ? 'success' : 'default'}>
                {project.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* ── Tab navigation ── */}
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Project tabs">
          {TABS.map((tab) => {
            const href = `/projects/${id}/${tab.segment}`
            const isActive = pathname.startsWith(href)

            return (
              <Link
                key={tab.segment}
                to={`/projects/$id/${tab.segment}`}
                params={{ id }}
                className={cn(
                  'shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-accent text-fg'
                    : 'border-transparent text-fg-muted hover:text-fg hover:border-border'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* ── Child route content ── */}
      <Outlet />
    </div>
  )
}
