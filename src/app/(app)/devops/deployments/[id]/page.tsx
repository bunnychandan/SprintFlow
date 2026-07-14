"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, XCircle, RotateCcw, RefreshCw } from "lucide-react";
import { PageHeader, Button, Card, Badge, ErrorState } from "@/components/ui";
import { useDeployment, useDeploymentActions, useLogs } from "@/hooks/use-devops";
import { DeploymentStatusBadge } from "@/components/devops/deployment-status-badge";
import { DeploymentProgress } from "@/components/devops/deployment-progress";
import { DeploymentTimeline } from "@/components/devops/deployment-timeline";
import { DeploymentLogs } from "@/components/devops/deployment-logs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/contexts/toast-context";

export default function DeploymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params?.id as string;

  const { data: deployment, loading, refetch } = useDeployment(id);
  const { start, cancel, rollback, loading: actionLoading } = useDeploymentActions();
  const { data: logs, loading: logsLoading } = useLogs(id);

  const [activeTab, setActiveTab] = useState("overview");
  const [confirmAction, setConfirmAction] = useState<"start" | "cancel" | "rollback" | null>(null);

  const handleStart = useCallback(async () => {
    try {
      await start(id);
      addToast({ type: "success", message: "Deployment started" });
      refetch();
    } catch (e) {
      addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to start deployment" });
    }
    setConfirmAction(null);
  }, [id, start, addToast, refetch]);

  const handleCancel = useCallback(async () => {
    try {
      await cancel(id);
      addToast({ type: "success", message: "Deployment cancelled" });
      refetch();
    } catch (e) {
      addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to cancel deployment" });
    }
    setConfirmAction(null);
  }, [id, cancel, addToast, refetch]);

  const handleRollback = useCallback(async () => {
    try {
      await rollback(id);
      addToast({ type: "success", message: "Rollback initiated" });
      refetch();
    } catch (e) {
      addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to rollback deployment" });
    }
    setConfirmAction(null);
  }, [id, rollback, addToast, refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-hover rounded animate-pulse" />
        <div className="h-64 bg-surface-hover rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!deployment) {
    return <ErrorState title="Deployment not found" message="The requested deployment does not exist." />;
  }

  const tabs = ["Overview", "Logs", "Timeline", "Rollback"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${deployment.version}`}
        subtitle={`${deployment.projectCode} - ${deployment.projectName} · ${deployment.environment}`}
        metadata="DEPLOYMENT"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            {deployment.status === "PENDING" && (
              <Button variant="gradient" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={() => setConfirmAction("start")} isLoading={actionLoading}>
                Start
              </Button>
            )}
            {(deployment.status === "PENDING" || deployment.status === "RUNNING") && (
              <Button variant="ghost" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setConfirmAction("cancel")} isLoading={actionLoading}>
                Cancel
              </Button>
            )}
            {deployment.status === "SUCCESS" && (
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmAction("rollback")} isLoading={actionLoading}>
                Rollback
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 text-sm text-foreground-secondary">
        <DeploymentStatusBadge status={deployment.status} />
        {deployment.duration && <span>Duration: {deployment.duration}s</span>}
        {deployment.branch && <span>Branch: {deployment.branch}</span>}
        {deployment.commitHash && <span>Commit: {deployment.commitHash.slice(0, 7)}</span>}
        {deployment.deployedByName && <span>By: {deployment.deployedByName}</span>}
      </div>

      <DeploymentProgress status={deployment.status} duration={deployment.duration} />

      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.toLowerCase()
                ? "text-accent border-accent"
                : "text-foreground-muted border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-2">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Deployment Details</h4>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-foreground-muted">Version</dt><dd className="text-foreground font-medium">{deployment.version}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Environment</dt><dd className="text-foreground font-medium">{deployment.environment}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Status</dt><dd><DeploymentStatusBadge status={deployment.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Project</dt><dd className="text-foreground font-medium">{deployment.projectName}</dd></div>
              {deployment.releaseName && <div className="flex justify-between"><dt className="text-foreground-muted">Release</dt><dd className="text-foreground font-medium">{deployment.releaseName}</dd></div>}
              {deployment.branch && <div className="flex justify-between"><dt className="text-foreground-muted">Branch</dt><dd className="text-foreground font-medium">{deployment.branch}</dd></div>}
              {deployment.commitHash && <div className="flex justify-between"><dt className="text-foreground-muted">Commit</dt><dd className="text-foreground font-medium">{deployment.commitHash}</dd></div>}
              {deployment.deployedByName && <div className="flex justify-between"><dt className="text-foreground-muted">Deployed By</dt><dd className="text-foreground font-medium">{deployment.deployedByName}</dd></div>}
              {deployment.startedAt && <div className="flex justify-between"><dt className="text-foreground-muted">Started</dt><dd className="text-foreground font-medium">{new Date(deployment.startedAt).toLocaleString()}</dd></div>}
              {deployment.completedAt && <div className="flex justify-between"><dt className="text-foreground-muted">Completed</dt><dd className="text-foreground font-medium">{new Date(deployment.completedAt).toLocaleString()}</dd></div>}
              {deployment.duration && <div className="flex justify-between"><dt className="text-foreground-muted">Duration</dt><dd className="text-foreground font-medium">{deployment.duration}s</dd></div>}
              {deployment.rollbackFromId && <div className="flex justify-between"><dt className="text-foreground-muted">Rollback From</dt><dd className="text-accent font-medium">{deployment.rollbackFromId}</dd></div>}
              <div className="flex justify-between"><dt className="text-foreground-muted">Created</dt><dd className="text-foreground font-medium">{new Date(deployment.createdAt).toLocaleString()}</dd></div>
            </dl>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Quick Actions</h4>
            <div className="space-y-3">
              {deployment.status === "PENDING" && (
                <Button variant="gradient" className="w-full" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={() => setConfirmAction("start")}>
                  Start Deployment
                </Button>
              )}
              {(deployment.status === "PENDING" || deployment.status === "RUNNING") && (
                <Button variant="ghost" className="w-full" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setConfirmAction("cancel")}>
                  Cancel Deployment
                </Button>
              )}
              {deployment.status === "SUCCESS" && (
                <Button variant="ghost" className="w-full" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmAction("rollback")}>
                  Rollback
                </Button>
              )}
              {deployment.status !== "PENDING" && deployment.status !== "RUNNING" && deployment.status !== "SUCCESS" && (
                <p className="text-xs text-foreground-muted text-center">No actions available for this state</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "logs" && (
        <DeploymentLogs logs={logs} loading={logsLoading} />
      )}

      {activeTab === "timeline" && (
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Deployment Timeline</h4>
          <DeploymentTimeline deployments={[deployment]} />
        </Card>
      )}

      {activeTab === "rollback" && (
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Rollback Information</h4>
          {deployment.rollbackFromId ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground-secondary">This deployment is a rollback of a previous deployment.</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground-muted">Original deployment:</span>
                <span className="text-sm text-accent font-medium">{deployment.rollbackFromId}</span>
              </div>
            </div>
          ) : deployment.status === "SUCCESS" ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground-secondary">You can rollback this deployment to revert changes.</p>
              <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setConfirmAction("rollback")}>
                Rollback to Previous Version
              </Button>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">Rollback is only available for successful deployments.</p>
          )}
        </Card>
      )}

      <ConfirmDialog
        isOpen={confirmAction === "start"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleStart}
        title="Start Deployment"
        message={`Are you sure you want to start deployment ${deployment.version} to ${deployment.environment}?`}
        confirmLabel="Start"
      />

      <ConfirmDialog
        isOpen={confirmAction === "cancel"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleCancel}
        title="Cancel Deployment"
        message={`Are you sure you want to cancel deployment ${deployment.version}?`}
        confirmLabel="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmAction === "rollback"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleRollback}
        title="Rollback Deployment"
        message={`Are you sure you want to rollback deployment ${deployment.version} on ${deployment.environment}?`}
        confirmLabel="Rollback"
        variant="danger"
      />
    </div>
  );
}
