"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Download } from "lucide-react";
import { PageHeader, Button, EmptyState } from "@/components/ui";
import { useDeployments } from "@/hooks/use-devops";
import type { EnvironmentType, DeploymentStatus } from "@/types/devops";
import { DeploymentTable } from "@/components/devops/deployment-table";
import { DeploymentFilters } from "@/components/devops/deployment-filters";
import { DevOpsExportDialog } from "@/components/devops/devops-export-dialog";
import { exportData } from "@/services/devops";
import { useToast } from "@/contexts/toast-context";

export default function DeploymentsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [environment, setEnvironment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, loading, error, refetch } = useDeployments({
    search: search || undefined,
    environment: (environment as any) || undefined,
    status: (status as any) || undefined,
    page,
    pageSize: 20,
  });

  const deployments = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const hasActiveFilters = !!(search || environment || status);

  const clearFilters = useCallback(() => {
    setSearch("");
    setEnvironment("");
    setStatus("");
    setPage(1);
  }, []);

  const handleExport = useCallback(async (format: "csv" | "json", type: "deployments" | "pipelines" | "dashboard") => {
    setExporting(true);
    try {
      await exportData({ format, type: type as "deployments" | "pipelines" | "dashboard", filters: { search, environment: (environment || undefined) as EnvironmentType | undefined, status: (status || undefined) as DeploymentStatus | undefined } });
      addToast({ type: "success", message: "Export completed" });
      setExportOpen(false);
    } catch {
      addToast({ type: "error", message: "Export failed" });
    } finally {
      setExporting(false);
    }
  }, [addToast, search, environment, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deployments"
        subtitle="Manage and monitor your deployments across environments"
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

      <DeploymentFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        environment={environment}
        onEnvironmentChange={(v) => { setEnvironment(v); setPage(1); }}
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {loading ? (
        <DeploymentTable data={[]} loading />
      ) : error ? (
        <div className="rounded-2xl border border-border p-8 text-center text-sm text-red-500">{error}</div>
      ) : deployments.length === 0 ? (
        <EmptyState
          title="No deployments found"
          description={hasActiveFilters ? "Try adjusting your filters" : "Create your first deployment to get started"}
        />
      ) : (
        <>
          <DeploymentTable data={deployments} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">{total} total deployments</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <span className="text-sm text-foreground-muted">Page {page} of {totalPages}</span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DevOpsExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
}
