"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { PipelineStatusBadge } from "./pipeline-status-badge";
import { Play, Activity } from "lucide-react";
import type { Pipeline } from "@/types/devops";

interface PipelineCardProps {
  pipeline: Pipeline;
  onRun?: (id: string) => void;
  className?: string;
}

export function PipelineCard({ pipeline, onRun, className }: PipelineCardProps) {
  return (
    <Card className={cn("p-5 hover:shadow-md transition-all", className)}>
      <Link href={`/devops/pipelines/${pipeline.id}`} className="block">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">{pipeline.name}</span>
          </div>
          <PipelineStatusBadge status={pipeline.status} />
        </div>
        <div className="text-xs text-foreground-secondary space-y-1">
          <p>{pipeline.projectCode} - {pipeline.projectName}</p>
          <p>Provider: {pipeline.provider}</p>
          {pipeline.lastRun && <p>Last run: {new Date(pipeline.lastRun).toLocaleDateString()}</p>}
          <p>Success: {pipeline.successCount} | Failed: {pipeline.failureCount}</p>
          {pipeline.duration && <p>Avg duration: {pipeline.duration}s</p>}
        </div>
      </Link>
      {onRun && pipeline.status !== "RUNNING" && (
        <button
          onClick={(e) => { e.preventDefault(); onRun(pipeline.id); }}
          className="mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-accent-light text-accent hover:bg-accent-light/80 transition-colors"
        >
          <Play className="h-3 w-3" /> Run Pipeline
        </button>
      )}
    </Card>
  );
}
