import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { AuthenticatedLayout } from "./shell/layout";
import { Providers } from "./providers";

// ─── Root ──────────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Providers,
});

// ─── /login (public — no shell) ───────────────────────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: lazyRouteComponent(() => import("@/routes/login/page"), "default"),
});

// ─── Authenticated shell ───────────────────────────────────────────────────────

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  component: AuthenticatedLayout,
});

// ─── Index — redirect to /projects ────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/projects" });
  },
});

// ─── Projects ─────────────────────────────────────────────────────────────────

const projectsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/projects",
  component: lazyRouteComponent(
    () => import("@/routes/projects/list"),
    "default",
  ),
});

const projectsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/projects/new",
  component: lazyRouteComponent(
    () => import("@/routes/projects/new"),
    "default",
  ),
});

// ─── Project (tabs shell) ─────────────────────────────────────────────────────

const projectRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/projects/$id",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/layout"),
    "default",
  ),
});

const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/projects/$id/overview", params });
  },
});

const projectOverviewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "overview",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/overview"),
    "default",
  ),
});

const projectEnvironmentsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "environments",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/environments"),
    "default",
  ),
});

const projectEnvVarsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "env-vars",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/env-vars"),
    "default",
  ),
});

const projectDeploymentsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "deployments",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/deployments/list"),
    "default",
  ),
});

const projectDeploymentDetailRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "deployments/$depId",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/deployments/$depId"),
    "default",
  ),
});

const projectDomainsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "domains",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/domains"),
    "default",
  ),
});

const projectDatabasesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "databases",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/databases"),
    "default",
  ),
});

const projectLogsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "logs",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/logs"),
    "default",
  ),
});

const projectMonitoringRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "monitoring",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/monitoring"),
    "default",
  ),
});

const projectSettingsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "settings",
  component: lazyRouteComponent(
    () => import("@/routes/projects/$id/settings"),
    "default",
  ),
});

// ─── Databases ────────────────────────────────────────────────────────────────

const databasesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/databases",
  component: lazyRouteComponent(
    () => import("@/routes/databases/list"),
    "default",
  ),
});

const databaseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/databases/$id",
  component: lazyRouteComponent(
    () => import("@/routes/databases/$id"),
    "default",
  ),
});

// ─── Domains ──────────────────────────────────────────────────────────────────

const domainsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/domains",
  component: lazyRouteComponent(
    () => import("@/routes/domains/list"),
    "default",
  ),
});

// ─── Logs ─────────────────────────────────────────────────────────────────────

const logsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/logs",
  component: lazyRouteComponent(() => import("@/routes/logs/page"), "default"),
});

// ─── Monitoring ───────────────────────────────────────────────────────────────

const monitoringRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/monitoring",
  component: lazyRouteComponent(
    () => import("@/routes/monitoring/page"),
    "default",
  ),
});

// ─── Audit ────────────────────────────────────────────────────────────────────

const auditRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/audit",
  component: lazyRouteComponent(() => import("@/routes/audit/page"), "default"),
});

// ─── Settings ─────────────────────────────────────────────────────────────────

const settingsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/settings",
  component: lazyRouteComponent(
    () => import("@/routes/settings/page"),
    "default",
  ),
});

// ─── Route tree ───────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    indexRoute,
    projectsRoute,
    projectsNewRoute,
    projectRoute.addChildren([
      projectIndexRoute,
      projectOverviewRoute,
      projectEnvironmentsRoute,
      projectEnvVarsRoute,
      projectDeploymentsRoute,
      projectDeploymentDetailRoute,
      projectDomainsRoute,
      projectDatabasesRoute,
      projectLogsRoute,
      projectMonitoringRoute,
      projectSettingsRoute,
    ]),
    databasesRoute,
    databaseDetailRoute,
    domainsRoute,
    logsRoute,
    monitoringRoute,
    auditRoute,
    settingsRoute,
  ]),
]);

// ─── Router ───────────────────────────────────────────────────────────────────

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
