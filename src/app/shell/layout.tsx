import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useMe } from "@/features/auth/hooks";
import { useProjectsQuery } from "@/features/projects/hooks";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { Skeleton } from "@/components/ui/skeleton";
import { CommandPalette } from "@/components/command-palette";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function ShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-0">
      {/* Sidebar placeholder */}
      <div className="w-[240px] flex-shrink-0 bg-bg-1 border-r border-border" />
      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="h-[60px] flex-shrink-0 bg-bg-1 border-b border-border" />
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Authenticated layout ──────────────────────────────────────────────────────

export function AuthenticatedLayout() {
  const navigate = useNavigate();

  // ── Auth check ──────────────────────────────────────────────────────────────
  const { data: user, isLoading, isError } = useMe()

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      navigate({ to: '/login', replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isError, user])

  // ── Sidebar state ───────────────────────────────────────────────────────────
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);

  // ── Command palette ─────────────────────────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const { data: projects = [] } = useProjectsQuery();

  const openCmdPalette = useCallback(() => setCmdOpen(true), []);
  useKeyboardShortcut({ key: "k", meta: true }, openCmdPalette);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) return <ShellSkeleton />;
  if (isError || !user) return null;

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-bg-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onOpenCommandPalette={openCmdPalette} />

          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        projects={projects}
      />
    </>
  );
}
