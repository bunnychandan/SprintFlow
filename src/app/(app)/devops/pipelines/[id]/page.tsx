"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, RefreshCw } from "lucide-react";
import { PageHeader, Button, Card, ErrorState } from "@/components/ui";
import { usePipeline, usePipelineActions } from "@/hooks/use-devops";
import { PipelineStatusBadge } from "@/components/devops/pipeline-status-badge";
import { PipelineRunDialog } from "@/components/devops/pipeline-run-dialog";
import { PipelineStatistics } from "@/components/devops/pipeline-statistics";
import { useToast } from "@/contexts/toast-context";

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params?.id as string;

  const { data: pipeline, loading, refetch } = usePipeline(id);
  const { run, loading: actionLoading } = usePipelineActions();
  const [activeTab, setActiveTab] = useState("overview");
  const [runOpen, setRunOpen] = useState(false);

  const handleRun = useCallback(async () => {
    try {
      await run(id);
      addToast({ type: "success", message: "Pipeline started" });
      refetch();
    } catch (e) {
      addToast({ type: "error", message: e instanceof Error ? e.message : "Failed to run pipeline" });
    }
    setRunOpen(false);
  }, [id, run, addToast, refetch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-hover rounded animate-pulse" />
        <div className="h-64 bg-surface-hover rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!pipeline) {
    return <ErrorState title="Pipeline not found" message="The requested pipeline does not exist." />;
  }

  const tabs = ["Overview", "Statistics"];

  return (
    <div className="space-y-6">
      <PageHeader
        title={pipeline.name}
        subtitle={`${pipeline.projectCode} - ${pipeline.projectName} · ${pipeline.provider}`}
        metadata="PIPELINE"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
            {pipeline.status !== "RUNNING" && (
              <Button variant="gradient" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={() => setRunOpen(true)} isLoading={actionLoading}>
                Run
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={refetch} leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 text-sm text-foreground-secondary">
        <PipelineStatusBadge status={pipeline.status} />
        {pipeline.lastRun && <span>Last run: {new Date(pipeline.lastRun).toLocaleString()}</span>}
        {pipeline.duration && <span>Avg duration: {pipeline.duration}s</span>}
      </div>

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
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Pipeline Details</h4>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-foreground-muted">Name</dt><dd className="text-foreground font-medium">{pipeline.name}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Provider</dt><dd className="text-foreground font-medium">{pipeline.provider}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Status</dt><dd><PipelineStatusBadge status={pipeline.status} /></dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Project</dt><dd className="text-foreground font-medium">{pipeline.projectName}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Success Count</dt><dd className="text-emerald-500 font-medium">{pipeline.successCount}</dd></div>
              <div className="flex justify-between"><dt className="text-foreground-muted">Failure Count</dt><dd className="text-red-500 font-medium">{pipeline.failureCount}</dd></div>
              {pipeline.lastRun && <div className="flex justify-between"><dt className="text-foreground-muted">Last Run</dt><dd className="text-foreground font-medium">{new Date(pipeline.lastRun).toLocaleString()}</dd></div>}
              {pipeline.duration && <div className="flex justify-between"><dt className="text-foreground-muted">Avg Duration</dt><dd className="text-foreground font-medium">{pipeline.duration}s</dd></div>}
              <div className="flex justify-between"><dt className="text-foreground-muted">Created</dt><dd className="text-foreground font-medium">{new Date(pipeline.createdAt).toLocaleString()}</dd></div>
            </dl>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Actions</h4>
            <div className="space-y-3">
              {pipeline.status !== "RUNNING" ? (
                <Button variant="gradient" className="w-full" size="sm" leftIcon={<Play className="h-4 w-4" />} onClick={() => setRunOpen(true)}>
                  Run Pipeline
                </Button>
              ) : (
                <p className="text-xs text-foreground-muted text-center">Pipeline is currently running</p>
              )}
            </div>
          </Card>

          {pipeline.configuration && (
            <Card className="p-5 lg:col-span-3">
              <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Configuration</h4>
              <pre className="bg-surface-hover rounded-xl p-4 text-xs text-foreground-secondary font-mono overflow-x-auto">
                {JSON.stringify(pipeline.configuration, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      )}

      {activeTab === "statistics" && (
        <PipelineStatistics pipelines={[pipeline]} />
      )}

      <PipelineRunDialog
        isOpen={runOpen}
        onClose={() => setRunOpen(false)}
        onConfirm={handleRun}
        pipelineName={pipeline.name}
        loading={actionLoading}
      />
    </div>
  );
}
