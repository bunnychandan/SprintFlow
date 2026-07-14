"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { DeploymentStatusBadge } from "./deployment-status-badge";
import { GitBranch, GitCommit, Clock, User } from "lucide-react";
import type { Deployment } from "@/types/devops";

interface DeploymentCardProps {
  deployment: Deployment;
  className?: string;
}

export function DeploymentCard({ deployment, className }: DeploymentCardProps) {
  return (
    <Card className={cn("p-5 hover:shadow-md transition-all", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{deployment.version}</span>
          <span className="text-xs text-foreground-muted">#{deployment.id.slice(0, 8)}</span>
        </div>
        <DeploymentStatusBadge status={deployment.status} />
      </div>
      <div className="space-y-1.5 text-xs text-foreground-secondary">
        <div className="flex items-center gap-2"><Clock className="h-3 w-3" />{deployment.environment}</div>
        {deployment.branch && <div className="flex items-center gap-2"><GitBranch className="h-3 w-3" />{deployment.branch}</div>}
        {deployment.commitHash && <div className="flex items-center gap-2"><GitCommit className="h-3 w-3" />{deployment.commitHash.slice(0, 7)}</div>}
        {deployment.deployedByName && <div className="flex items-center gap-2"><User className="h-3 w-3" />{deployment.deployedByName}</div>}
      </div>
      {deployment.duration && (
        <div className="mt-3 text-xs text-foreground-muted">Duration: {deployment.duration}s</div>
      )}
    </Card>
  );
}
