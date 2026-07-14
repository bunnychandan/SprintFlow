"use client";

import { cn } from "@/lib/cn";

interface DeploymentProgressProps {
  status: string;
  duration?: number | null;
  className?: string;
}

export function DeploymentProgress({ status, duration, className }: DeploymentProgressProps) {
  const isRunning = status === "RUNNING";
  const isComplete = status === "SUCCESS" || status === "FAILED" || status === "CANCELLED" || status === "ROLLED_BACK";
  const progress = isRunning ? 50 : isComplete ? 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            status === "SUCCESS" ? "bg-emerald-500" :
            status === "FAILED" ? "bg-red-500" :
            status === "RUNNING" ? "bg-blue-500 animate-pulse" :
            "bg-gray-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-foreground-secondary">
        <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
        {duration && <span>{duration}s</span>}
      </div>
    </div>
  );
}
