"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import type { Deployment } from "@/types/devops";
import { DeploymentStatusBadge } from "./deployment-status-badge";

interface BuildHistoryTableProps {
  deployments: Deployment[];
  loading?: boolean;
  className?: string;
}

export function BuildHistoryTable({ deployments, loading, className }: BuildHistoryTableProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-48 rounded bg-surface-hover" /></Card>;
  }

  if (!deployments || deployments.length === 0) {
    return <Card className={cn("p-5", className)}><p className="text-sm text-foreground-secondary text-center py-8">No build history</p></Card>;
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Build History</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {deployments.map((d) => (
          <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-sm text-foreground">{d.version}</p>
              <p className="text-xs text-foreground-muted">{d.environment} · {d.branch || "no branch"}</p>
            </div>
            <div className="flex items-center gap-3">
              {d.duration && <span className="text-xs text-foreground-muted">{d.duration}s</span>}
              <DeploymentStatusBadge status={d.status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
