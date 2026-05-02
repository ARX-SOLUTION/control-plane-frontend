# Control Plane Frontend — Project Context for Claude

## Claude Behavior Guidelines

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

Every changed line must trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Transform tasks into verifiable goals:
- "Fix the bug" → `npm run build` exits 0 before and after.
- "Add a component" → component renders in browser, no console errors.

---

## What this is

React 18 + Vite frontend for the Control Plane backend (NestJS mini-PaaS).
Single-admin dashboard: projects, deployments, databases, env vars, domains, logs, monitoring.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Routing | TanStack Router v1 |
| Server state | TanStack Query v5 |
| Forms | react-hook-form + zod |
| Styling | Tailwind CSS v3 + CSS variables |
| Components | Radix UI primitives (hand-written wrappers) |
| Icons | lucide-react |
| Tables | TanStack Table v8 |
| Toasts | sonner |
| Command palette | cmdk |

## Directory Structure

```
src/
├── main.tsx                  # Entry point
├── app/
│   ├── router.tsx            # TanStack Router route tree (all lazy imports)
│   ├── providers.tsx         # Root component (sets on401 handler)
│   └── shell/
│       ├── layout.tsx        # AuthenticatedLayout (auth guard + sidebar + topbar)
│       ├── sidebar.tsx       # Collapsible sidebar (Cmd+\)
│       └── topbar.tsx        # Topbar with Cmd+K and user dropdown
├── routes/                   # Page components (one file per route)
│   ├── login/page.tsx
│   ├── projects/...
│   ├── databases/...
│   ├── domains/...
│   ├── logs/page.tsx
│   ├── monitoring/page.tsx
│   ├── audit/page.tsx
│   └── settings/page.tsx
├── features/                 # Business logic + data hooks
│   ├── auth/{api,hooks}.ts
│   ├── projects/{api,hooks,schemas}.ts
│   ├── environments/{api,hooks}.ts
│   ├── env-vars/{api,hooks}.ts
│   ├── deployments/{api,hooks}.ts
│   ├── databases/{api,hooks}.ts
│   ├── domains/{api,hooks}.ts
│   ├── vcs/{api,hooks}.ts
│   ├── backup/{api,hooks}.ts
│   ├── monitoring/{api,hooks}.ts
│   └── notifications/{api,hooks}.ts
├── components/
│   ├── ui/                   # Radix-based primitives (button, input, dialog, etc.)
│   ├── status-badge.tsx      # DeploymentStatus → colored pill
│   ├── deployment-timeline.tsx
│   ├── data-table/           # Generic TanStack Table wrapper
│   └── command-palette.tsx   # Cmd+K with cmdk
├── lib/
│   ├── api.ts                # fetch wrapper (credentials:include, throws ApiError)
│   ├── ws.ts                 # WebSocket client (typed, auto-reconnect)
│   ├── query-client.ts       # QueryClient + ApiError class
│   └── utils.ts              # cn(), formatRelativeTime, formatAbsoluteTime, formatBytes
├── hooks/
│   ├── use-keyboard-shortcut.ts
│   └── use-local-storage.ts
├── styles/
│   ├── tokens.css            # CSS variables (light + dark)
│   └── globals.css           # Tailwind base + scrollbars + focus ring
└── types/index.ts            # All shared TS interfaces
```

## Design Token Usage

**Never hardcode colors.** Use Tailwind token classes:

| Purpose | Class |
|---------|-------|
| Page background | `bg-bg-0` |
| Card/panel | `bg-bg-1` |
| Hover/fill | `bg-bg-2` |
| Pressed/input | `bg-bg-3` |
| Primary text | `text-fg` |
| Secondary | `text-fg-muted` |
| Placeholder | `text-fg-subtle` |
| Border | `border border-border` |
| Accent button | `bg-accent text-accent-fg` |
| Success | `text-success bg-success-soft` |
| Warning | `text-warning bg-warning-soft` |
| Danger | `text-danger bg-danger-soft` |

Mono font: `font-mono` for IDs, hashes, env keys, container names, durations.

## Coding Conventions

- **Route components** are in `routes/` and compose features. No API calls directly in routes.
- **Feature hooks** (`features/*/hooks.ts`) call the API. `features/*/api.ts` contains raw API functions.
- **UI components** (`components/ui/`) are dumb — no business logic, no API calls.
- **Custom components** (`components/`) may accept data props but don't fetch.
- **Forms**: `useForm({ resolver: zodResolver(schema) })`. Schemas defined in `features/*/schemas.ts`.
- **Mutations**: always invalidate affected query keys on success, show `toast.success()`.
- **Query keys**: `['projects']`, `['projects', id]`, `['environments', projectId]`, etc.
- **Keyboard shortcuts**: use `useKeyboardShortcut` hook.
- **localStorage**: use `useLocalStorage` hook (syncs across tabs).

## Adding a New Page

1. Create `src/routes/<path>/page.tsx` with `export default function MyPage() {}`
2. Add a route in `src/app/router.tsx` using `lazyRouteComponent(() => import('@/routes/<path>/page'), 'default')`
3. If it needs data, add `api.ts` + `hooks.ts` under `src/features/<name>/`

## Running & Building

```bash
npm run dev       # Dev server at :5173, proxies /api → :3000
npm run build     # tsc + vite build
npm run preview   # Preview production build
```

## Out of Scope

- Mobile-specific layouts
- SSR / server components
- GraphQL
- Redux / Zustand
- Multi-user / auth flows beyond single admin login

## How to Work with Me

- Reply in Uzbek for explanations; code/identifiers in English.
- `Uncertainty: <0..1>` at the top of every reply. If > 0.05, ask before implementing.
- Prefer line-by-line edits over full-file rewrites when the change is small.
- Verify with `npm run build` — zero errors is the success criterion.
