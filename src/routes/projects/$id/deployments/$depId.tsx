import * as React from "react";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { AlertTriangle, XCircle } from "lucide-react";
import {
  useDeploymentQuery,
  useCancelDeploymentMutation,
} from "@/features/deployments/hooks";
import { DeploymentTimeline } from "@/components/deployment-timeline";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Deployment, DeploymentStatus } from "@/types";
import type {
  TimelineStep,
  StepStatus,
} from "@/components/deployment-timeline";
import {
  formatAbsoluteTime,
  formatRelativeTime,
  formatDuration,
} from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES: DeploymentStatus[] = [
  "pending",
  "cloning",
  "building",
  "starting",
  "health_check",
  "switching",
];

// ─── Build timeline steps from deployment ─────────────────────────────────────

const PIPELINE: Array<{ key: DeploymentStatus; label: string }> = [
  { key: "cloning", label: "Clone Repository" },
  { key: "building", label: "Build Image" },
  { key: "starting", label: "Start Container" },
  { key: "health_check", label: "Health Check" },
  { key: "switching", label: "Switch Traffic" },
];

const STATUS_INDEX: Partial<Record<DeploymentStatus, number>> = {
  pending: -1,
  cloning: 0,
  building: 1,
  starting: 2,
  health_check: 3,
  switching: 4,
  success: 5,
};

function buildSteps(dep: Deployment): TimelineStep[] {
  const isFailed = dep.status === "failed" || dep.status === "rolled_back";
  const currentIdx = STATUS_INDEX[dep.status] ?? (isFailed ? 5 : -1);

  // For failed deps, guess where it failed from logs
  let failedAt = 4;
  if (isFailed) {
    if (!dep.buildLogs) failedAt = 0;
    else if (!dep.deployLogs) failedAt = 1;
    else failedAt = 2;
  }

  return PIPELINE.map((step, idx) => {
    let status: StepStatus;
    if (isFailed) {
      if (idx < failedAt) status = "done";
      else if (idx === failedAt) status = "failed";
      else status = "pending";
    } else if (dep.status === "success") {
      status = "done";
    } else if (dep.status === "pending") {
      status = "pending";
    } else {
      if (idx < currentIdx) status = "done";
      else if (idx === currentIdx) status = "running";
      else status = "pending";
    }

    const logs =
      step.key === "building"
        ? (dep.buildLogs ?? undefined)
        : step.key === "starting"
          ? (dep.deployLogs ?? undefined)
          : undefined;

    return { name: step.label, status, logs };
  });
}

// ─── Metadata row ─────────────────────────────────────────────────────────────

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-fg-muted w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-fg break-all">{children}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeploymentDetailPage() {
  const { depId } = useParams({ strict: false }) as {
    id: string;
    depId: string;
  };

  // Start polling at 2s; stop once the deployment reaches a terminal state
  const [refetchInterval, setRefetchInterval] = React.useState<number | false>(
    2000,
  );
  const { data: dep, isLoading } = useDeploymentQuery(depId, {
    refetchInterval,
  });

  React.useEffect(() => {
    if (dep) {
      const stillActive = ACTIVE_STATUSES.includes(dep.status);
      setRefetchInterval(stillActive ? 2000 : false);
    }
  }, [dep]);

  const { mutate: cancelDeployment, isPending: cancelling } =
    useCancelDeploymentMutation();

  const handleCancel = () => {
    cancelDeployment(depId, {
      onSuccess: () => toast.success("Deployment cancelled"),
      onError: (err: unknown) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to cancel deployment",
        ),
    });
  };

  if (isLoading || !dep) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const steps = buildSteps(dep);
  const duration =
    dep.startedAt && dep.completedAt
      ? formatDuration(
          new Date(dep.completedAt).getTime() -
            new Date(dep.startedAt).getTime(),
        )
      : null;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs text-fg-muted mb-0.5">Deployment</p>
            <h1 className="text-xl font-semibold text-fg font-mono">
              {dep.id.slice(0, 16)}
            </h1>
          </div>
          <StatusBadge status={dep.status} />
        </div>
        <div className="flex gap-2">
          {dep.status === "pending" && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancel}
              loading={cancelling}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* ── Error alert ── */}
      {dep.status === "failed" && dep.errorMessage && (
        <Alert
          variant="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
          className="mb-5"
        >
          <AlertTitle>Deployment Failed</AlertTitle>
          <AlertDescription className="font-mono text-xs break-all">
            {dep.errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: timeline ── */}
        <div className="bg-bg-1 border border-border rounded-lg p-5">
          <h2 className="text-sm font-medium text-fg mb-4">Pipeline</h2>
          <DeploymentTimeline steps={steps} />
        </div>

        {/* ── Right: metadata ── */}
        <div className="space-y-4">
          <div className="bg-bg-1 border border-border rounded-lg p-5">
            <h2 className="text-sm font-medium text-fg mb-3">Details</h2>
            <div>
              {dep.branch && (
                <MetaRow label="Branch">
                  <code className="font-mono text-xs">{dep.branch}</code>
                </MetaRow>
              )}
              {dep.commitHash && (
                <MetaRow label="Commit">
                  <code className="font-mono text-xs">
                    {dep.commitHash.slice(0, 7)}
                  </code>
                </MetaRow>
              )}
              {dep.commitMessage && (
                <MetaRow label="Message">
                  <span className="text-xs">{dep.commitMessage}</span>
                </MetaRow>
              )}
              {dep.startedAt && (
                <MetaRow label="Started">
                  {formatAbsoluteTime(dep.startedAt)}
                </MetaRow>
              )}
              {dep.completedAt && (
                <MetaRow label="Completed">
                  {formatAbsoluteTime(dep.completedAt)}
                </MetaRow>
              )}
              {duration && (
                <MetaRow label="Duration">
                  <span className="tabular-nums">{duration}</span>
                </MetaRow>
              )}
              {dep.containerName && (
                <MetaRow label="Container">
                  <code className="font-mono text-xs">{dep.containerName}</code>
                </MetaRow>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Logs ── */}
      {(dep.buildLogs || dep.deployLogs) && (
        <div className="mt-6 space-y-4">
          {dep.buildLogs && (
            <div className="bg-bg-1 border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-2 border-b border-border">
                <h2 className="text-sm font-medium text-fg">Build Logs</h2>
              </div>
              <pre className="p-4 text-xs font-mono text-fg-muted leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto bg-bg-0">
                {dep.buildLogs}
              </pre>
            </div>
          )}
          {dep.deployLogs && (
            <div className="bg-bg-1 border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-bg-2 border-b border-border">
                <h2 className="text-sm font-medium text-fg">Deploy Logs</h2>
              </div>
              <pre className="p-4 text-xs font-mono text-fg-muted leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-72 overflow-y-auto bg-bg-0">
                {dep.deployLogs}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
