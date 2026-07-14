"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Rocket, RefreshCw, Download } from "lucide-react";
import { PageHeader, Button, Card, Skeleton } from "@/components/ui";
import { useDashboard } from "@/hooks/use-devops";
import { DevOpsDashboardCards } from "@/components/devops/devops-dashboard-cards";
import { EnvironmentStatusCard } from "@/components/devops/environment-status-card";
import { BuildHistoryTable } from "@/components/devops/build-history-table";
import { DeploymentTimeline } from "@/components/devops/deployment-timeline";
import { DevOpsExportDialog } from "@/components/devops/devops-export-dialog";
import { DevOpsEmptyState } from "@/components/devops/devops-empty-state";
import { PipelineStatistics } from "@/components/devops/pipeline-statistics";
import { usePipelines, useDeployments } from "@/hooks/use-devops";
import { exportData } from "@/services/devops";
import { useToast } from "@/contexts/toast-context";

export default function DevOpsDashboardPage() {
  const { addToast } = useToast();
  const { data: dashboard, loading, error, refetch } = useDashboard();
  const { data: pipelinesData } = usePipelines({ pageSize: 100 });
  const { data: deploymentsData } = useDeployments({ pageSize: 10 });
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const deployments = deploymentsData?.data || [];
  const pipelines = pipelinesData || [];

  const handleExport = useCallback(async (format: "csv" | "json", type: "deployments" | "pipelines" | "dashboard") => {
    setExporting(true);
    try {
      await exportData({ format, type, filters: {} });
      addToast({ type: "success", message: "Export completed" });
      setExportOpen(false);
    } catch {
      addToast({ type: "error", message: "Export failed" });
    } finally {
      setExporting(false);
    }
  }, [addToast]);

  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-2">{error}</p><button onClick={() => refetch()} className="text-sm underline">Retry</button></div>;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="DevOps Dashboard" subtitle="Deployments, pipelines and environment health" metadata="DEVOPS" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="DevOps Dashboard" subtitle="Deployments, pipelines and environment health" metadata="DEVOPS" />
        <DevOpsEmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="DevOps Dashboard"
        subtitle="Deployments, pipelines and environment health"
        metadata="DEVOPS"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExportOpen(true)} leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      <DevOpsDashboardCards data={dashboard} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Environment Health</h4>
            </div>
            {dashboard.environments && dashboard.environments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {dashboard.environments.map((env) => (
                  <EnvironmentStatusCard key={env.environment} environment={env} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground-muted text-center py-4">No environment data</p>
            )}
          </Card>
        </div>

        <div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Recent Deployments</h4>
              <Link href="/devops/deployments" className="text-xs text-accent hover:underline">View all</Link>
            </div>
            {deployments.length > 0 ? (
              <DeploymentTimeline deployments={deployments} />
            ) : (
              <p className="text-sm text-foreground-muted text-center py-4">No deployments yet</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuildHistoryTable deployments={deployments} />
        <div>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Pipeline Overview</h4>
              <Link href="/devops/pipelines" className="text-xs text-accent hover:underline">View all</Link>
            </div>
            {pipelines.length > 0 ? (
              <PipelineStatistics pipelines={pipelines} />
            ) : (
              <p className="text-sm text-foreground-muted text-center py-4">No pipelines configured</p>
            )}
          </Card>
        </div>
      </div>

      <DevOpsExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}
