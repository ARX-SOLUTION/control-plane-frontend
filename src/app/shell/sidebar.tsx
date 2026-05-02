import { useCallback } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  FolderOpen,
  Globe,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ─── Nav definition ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: FolderOpen,  label: 'Projects',   to: '/projects'   },
  { icon: Database,    label: 'Databases',  to: '/databases'  },
  { icon: Globe,       label: 'Domains',    to: '/domains'    },
  { icon: FileText,    label: 'Logs',       to: '/logs'       },
  { icon: BarChart2,   label: 'Monitoring', to: '/monitoring' },
  { icon: ShieldCheck, label: 'Audit',      to: '/audit'      },
  { icon: Settings,    label: 'Settings',   to: '/settings'   },
] as const

// ─── Component ─────────────────────────────────────────────────────────────────

export interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { location } = useRouterState()

  // Stable callback so the shortcut hook doesn't re-register on every render
  const toggle = useCallback(() => onToggle(), [onToggle])
  useKeyboardShortcut({ key: '\\', meta: true }, toggle)

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'relative flex flex-col h-screen bg-bg-1 border-r border-border flex-shrink-0',
          'transition-all duration-200 ease-out overflow-hidden',
          collapsed ? 'w-[60px]' : 'w-[240px]',
        )}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center h-[60px] border-b border-border flex-shrink-0',
            collapsed ? 'justify-center' : 'px-4 gap-2.5',
          )}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-fg font-bold text-xs flex-shrink-0 select-none"
            aria-hidden="true"
          >
            CP
          </div>
          {!collapsed && (
            <span className="font-semibold text-fg text-sm tracking-tight truncate">
              Control Plane
            </span>
          )}
        </div>

        {/* ── Nav items ────────────────────────────────────────────────────── */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
            const isActive =
              location.pathname === to ||
              location.pathname.startsWith(to + '/')

            const linkEl = (
              <Link
                to={to}
                className={cn(
                  'flex items-center rounded-md text-sm transition-colors duration-150',
                  collapsed
                    ? 'justify-center w-10 h-10 mx-auto'
                    : 'gap-3 px-2.5 py-2 w-full',
                  isActive
                    ? 'bg-accent-soft text-accent font-medium'
                    : 'text-fg-muted hover:bg-bg-2 hover:text-fg',
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )

            return collapsed ? (
              <Tooltip key={to}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={to}>{linkEl}</div>
            )
          })}
        </nav>

        {/* ── Collapse toggle ───────────────────────────────────────────────── */}
        <div
          className={cn(
            'flex items-center border-t border-border p-2',
            collapsed ? 'justify-center' : 'justify-end',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-center w-7 h-7 rounded-md text-fg-subtle hover:bg-bg-2 hover:text-fg transition-colors"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? 'Expand' : 'Collapse'} sidebar
              <span className="ml-2 font-mono text-fg-subtle">⌘\</span>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
