"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import type { Deployment } from "@/types/devops";
import { DeploymentStatusBadge } from "./deployment-status-badge";

interface DeploymentTimelineProps {
  deployments: Deployment[];
  loading?: boolean;
  className?: string;
}

export function DeploymentTimeline({ deployments, loading, className }: DeploymentTimelineProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-48 rounded bg-surface-hover" /></Card>;
  }

  if (!deployments || deployments.length === 0) {
    return <Card className={cn("p-5", className)}><p className="text-sm text-foreground-secondary text-center py-8">No deployment history</p></Card>;
  }

  return (
    <div className={cn("space-y-0", className)}>
      {deployments.map((d, i) => (
        <div key={d.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < deployments.length - 1 && (
            <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-border" />
          )}
          <div className={cn(
            "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 mt-1",
            d.status === "SUCCESS" ? "border-emerald-500 bg-emerald-500/20" :
            d.status === "FAILED" ? "border-red-500 bg-red-500/20" :
            d.status === "RUNNING" ? "border-blue-500 bg-blue-500/20" :
            "border-gray-500 bg-gray-500/20"
          )}>
            <div className="h-2 w-2 rounded-full bg-current" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{d.version}</p>
              <DeploymentStatusBadge status={d.status} />
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">{d.environment} · {d.branch || "no branch"} · {d.deployedByName || "auto"}</p>
            {d.duration && <p className="text-xs text-foreground-muted mt-0.5">{d.duration}s</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
