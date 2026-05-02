import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, LogOut, Search } from 'lucide-react'
import { useMe, useLogout } from '@/features/auth/hooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, truncate } from '@/lib/utils'

// ─── Component ─────────────────────────────────────────────────────────────────

export interface TopbarProps {
  onOpenCommandPalette?: () => void
}

export function Topbar({ onOpenCommandPalette }: TopbarProps) {
  const navigate   = useNavigate()
  const { data: user }    = useMe()
  const logoutMutation    = useLogout()

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      navigate({ to: '/login', replace: true })
    }
  }

  const initials     = user?.email?.[0]?.toUpperCase() ?? '?'
  const displayEmail = user?.email ? truncate(user.email, 28) : '…'

  return (
    <header className="flex items-center h-[60px] px-4 bg-bg-1 border-b border-border flex-shrink-0 sticky top-0 z-10 gap-3">

      {/* ── Center: command palette trigger ─────────────────────────────────── */}
      <div className="flex-1 flex justify-center">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md w-full max-w-xs',
            'bg-bg-2 border border-border text-fg-muted text-sm',
            'hover:border-border-strong hover:text-fg transition-colors',
          )}
          aria-label="Open command palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left text-fg-subtle">Search or jump to…</span>
          <kbd className="hidden sm:flex items-center gap-px text-[10px] text-fg-subtle font-mono bg-bg-3 rounded px-1 py-0.5 leading-none">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* ── Right: status + user menu ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* System status */}
        <div
          className="hidden sm:flex items-center gap-1.5"
          title="All systems operational"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs text-fg-muted">Operational</span>
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg-2 transition-colors"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-soft border border-border text-xs font-semibold text-accent flex-shrink-0 select-none">
                {initials}
              </div>
              <span className="hidden md:block text-sm text-fg max-w-[140px] truncate">
                {displayEmail}
              </span>
              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-fg-subtle" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-xs font-normal text-fg-muted truncate">
                {user?.email ?? '—'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              danger
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  )
}
