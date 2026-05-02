import * as React from 'react'
import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BarChart2,
  Database,
  FileText,
  FolderOpen,
  Globe,
  Plus,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { Command } from 'cmdk'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import type { Project } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
}

// ─── Navigate items ────────────────────────────────────────────────────────────

const NAV_COMMANDS = [
  { icon: FolderOpen,  label: 'Go to Projects',   to: '/projects'   },
  { icon: Database,    label: 'Go to Databases',  to: '/databases'  },
  { icon: Globe,       label: 'Go to Domains',    to: '/domains'    },
  { icon: FileText,    label: 'Go to Logs',       to: '/logs'       },
  { icon: BarChart2,   label: 'Go to Monitoring', to: '/monitoring' },
  { icon: ShieldCheck, label: 'Go to Audit',      to: '/audit'      },
  { icon: Settings,    label: 'Go to Settings',   to: '/settings'   },
] as const

// ─── Command palette ───────────────────────────────────────────────────────────

export function CommandPalette({ open, onOpenChange, projects }: CommandPaletteProps) {
  const navigate = useNavigate()

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  // Cmd+K opens; Esc is handled natively by Radix Dialog
  useKeyboardShortcut({ key: 'k', meta: true }, () => onOpenChange(true))

  function runAndClose(fn: () => void) {
    fn()
    close()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-black/60',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />

        {/* Panel */}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-50',
            '-translate-x-1/2',
            'w-full max-w-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4',
          )}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>

          <Command
            className={cn(
              'flex flex-col rounded-lg border border-border bg-bg-1 shadow-lg overflow-hidden',
            )}
            shouldFilter
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 border-b border-border">
              <FolderOpen className="w-4 h-4 text-fg-muted flex-shrink-0" aria-hidden />
              <Command.Input
                placeholder="Search or jump to…"
                className={cn(
                  'flex-1 py-3 bg-transparent text-sm text-fg placeholder:text-fg-subtle',
                  'outline-none border-0',
                )}
                autoFocus
              />
              <kbd
                className="hidden sm:flex text-[10px] text-fg-subtle font-mono bg-bg-2 border border-border rounded px-1.5 py-0.5"
                title="Press Escape to close"
              >
                esc
              </kbd>
            </div>

            {/* Results */}
            <Command.List className="max-h-[380px] overflow-y-auto overscroll-contain py-2">
              <Command.Empty className="py-8 text-center text-sm text-fg-muted">
                No results found.
              </Command.Empty>

              {/* Navigate group */}
              <Command.Group
                heading="Navigate"
                className={cn(
                  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1',
                  '[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium',
                  '[&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:uppercase',
                  '[&_[cmdk-group-heading]]:tracking-wider',
                )}
              >
                {NAV_COMMANDS.map(({ icon: Icon, label, to }) => (
                  <CommandItem
                    key={to}
                    icon={<Icon className="w-4 h-4" />}
                    label={label}
                    onSelect={() => runAndClose(() => navigate({ to }))}
                  />
                ))}
              </Command.Group>

              {/* Projects group */}
              {projects.length > 0 && (
                <>
                  <Command.Separator className="my-1 h-px bg-border" />
                  <Command.Group
                    heading="Projects"
                    className={cn(
                      '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1',
                      '[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium',
                      '[&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:uppercase',
                      '[&_[cmdk-group-heading]]:tracking-wider',
                    )}
                  >
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        icon={<FolderOpen className="w-4 h-4" />}
                        label={project.displayName}
                        hint={project.name}
                        onSelect={() =>
                          runAndClose(() =>
                            navigate({
                              to: '/projects/$id',
                              params: { id: project.id },
                            }),
                          )
                        }
                      />
                    ))}
                  </Command.Group>
                </>
              )}

              {/* Actions group */}
              <Command.Separator className="my-1 h-px bg-border" />
              <Command.Group
                heading="Actions"
                className={cn(
                  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1',
                  '[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium',
                  '[&_[cmdk-group-heading]]:text-fg-subtle [&_[cmdk-group-heading]]:uppercase',
                  '[&_[cmdk-group-heading]]:tracking-wider',
                )}
              >
                <CommandItem
                  icon={<Plus className="w-4 h-4" />}
                  label="New Project"
                  onSelect={() => runAndClose(() => navigate({ to: '/projects/new' }))}
                />
              </Command.Group>
            </Command.List>

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-3 py-2 border-t border-border bg-bg-0">
              <HintKey>↑↓</HintKey><span className="text-xs text-fg-subtle">navigate</span>
              <HintKey>↵</HintKey><span className="text-xs text-fg-subtle">select</span>
              <HintKey>esc</HintKey><span className="text-xs text-fg-subtle">close</span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface CommandItemProps {
  icon: React.ReactNode
  label: string
  hint?: string
  onSelect: () => void
}

function CommandItem({ icon, label, hint, onSelect }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-3 px-3 py-2 mx-1 rounded-md cursor-pointer',
        'text-sm text-fg',
        'data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent',
        'transition-colors',
      )}
    >
      <span className="text-fg-muted data-[selected]:text-accent flex-shrink-0">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="text-xs text-fg-subtle font-mono truncate max-w-[120px]">
          {hint}
        </span>
      )}
    </Command.Item>
  )
}

function HintKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="text-[10px] text-fg-subtle font-mono bg-bg-2 border border-border rounded px-1 py-0.5 leading-none">
      {children}
    </kbd>
  )
}
