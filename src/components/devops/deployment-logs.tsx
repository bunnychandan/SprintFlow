"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

interface DeploymentLogsProps {
  logs: string[];
  loading?: boolean;
  className?: string;
}

export function DeploymentLogs({ logs, loading, className }: DeploymentLogsProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-48 rounded bg-surface-hover" /></Card>;
  }

  if (!logs || logs.length === 0) {
    return <Card className={cn("p-5", className)}><p className="text-sm text-foreground-secondary">No logs available</p></Card>;
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Deployment Logs</h4>
      <pre className="bg-surface-hover rounded-xl p-4 text-xs text-foreground-secondary font-mono overflow-x-auto max-h-96 overflow-y-auto">
        {logs.map((line, i) => (
          <div key={i} className="whitespace-nowrap">
            <span className="text-foreground-muted mr-2">{String(i + 1).padStart(3, "0")}</span>
            {line}
          </div>
        ))}
      </pre>
    </Card>
  );
}
