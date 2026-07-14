"use client";

import { useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { PageHeader, Button, Input, Select, EmptyState, Dialog } from "@/components/ui";
import { usePipelines, usePipelineActions } from "@/hooks/use-devops";
import { PipelineCard } from "@/components/devops/pipeline-card";
import { PipelineTable } from "@/components/devops/pipeline-table";
import { PipelineRunDialog } from "@/components/devops/pipeline-run-dialog";
import { useToast } from "@/contexts/toast-context";

export default function PipelinesPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [runPipelineId, setRunPipelineId] = useState<string | null>(null);

  const { data, loading, error, refetch } = usePipelines({
    search: search || undefined,
    status: (statusFilter as any) || undefined,
  });

  const { run, loading: actionLoading } = usePipelineActions();

  const pipelines = data || [];
  const hasActiveFilters = !!(search || statusFilter);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
  }, []);

  const handleRun = useCallback(async () => {
    if (!runPipelineId) return;
    try {
      await run(runPipelineId);
      addToast({ type: "success", message: "Pipeline started" });
      refetch();
    } catch (e) {
      addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to run pipeline" });
    }
    setRunPipelineId(null);
  }, [runPipelineId, run, addToast, refetch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipelines"
        subtitle="Manage and monitor your CI/CD pipelines"
        metadata="DEVOPS"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}>
              {viewMode === "grid" ? "Table View" : "Grid View"}
            </Button>
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Input
              placeholder="Search pipelines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "IDLE", label: "Idle" },
              { value: "RUNNING", label: "Running" },
              { value: "SUCCESS", label: "Success" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "rounded-2xl border border-border overflow-hidden"
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-surface rounded-2xl border border-border" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border p-8 text-center text-sm text-red-500">{error}</div>
      ) : pipelines.length === 0 ? (
        <EmptyState
          title="No pipelines found"
          description={hasActiveFilters ? "Try adjusting your filters" : "No CI/CD pipelines have been configured yet"}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelines.map((pipeline) => (
            <PipelineCard
              key={pipeline.id}
              pipeline={pipeline}
              onRun={(id) => setRunPipelineId(id)}
            />
          ))}
        </div>
      ) : (
        <PipelineTable
          data={pipelines}
          onRun={(id) => setRunPipelineId(id)}
        />
      )}

      <PipelineRunDialog
        isOpen={!!runPipelineId}
        onClose={() => setRunPipelineId(null)}
        onConfirm={handleRun}
        pipelineName={pipelines.find((p) => p.id === runPipelineId)?.name || ""}
        loading={actionLoading}
      />
    </div>
  );
}
