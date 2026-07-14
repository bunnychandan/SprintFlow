"use client";

import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { HealthHistoryPoint } from "@/types/admin";

interface HealthTimelineProps {
  data: HealthHistoryPoint[];
  className?: string;
}

const statusColor = {
  HEALTHY: "bg-success",
  WARNING: "bg-warning",
  CRITICAL: "bg-destructive",
  UNKNOWN: "bg-foreground-muted",
};

export function HealthTimeline({ data, className }: HealthTimelineProps) {
  if (data.length === 0) {
    return (
      <Card className={cn("flex items-center justify-center py-8 text-center", className)}>
        <p className="text-sm text-foreground-muted">No timeline data available</p>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-foreground">Health Timeline</h3>
      <div className="space-y-2">
        {sorted.slice(0, 20).map((point, i) => (
          <div key={point.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("h-3 w-3 rounded-full mt-1", statusColor[point.overallStatus])} />
              {i < sorted.length - 1 && <div className="w-px flex-1 bg-border/50 min-h-[24px]" />}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant={point.overallStatus === "HEALTHY" ? "success" : point.overallStatus === "WARNING" ? "warning" : point.overallStatus === "CRITICAL" ? "danger" : "neutral"} size="sm">
                  {point.overallStatus}
                </Badge>
                <span className="text-xs text-foreground-muted">
                  {new Date(point.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-foreground-secondary">
                {point.avgApiResponseMs !== null && <span>API: {point.avgApiResponseMs.toFixed(0)}ms</span>}
                {point.memoryUsageMB !== null && <span>Mem: {point.memoryUsageMB.toFixed(0)}MB</span>}
                {point.successRate !== null && <span>Success: {point.successRate.toFixed(1)}%</span>}
                {point.totalRequests !== null && <span>Req: {point.totalRequests}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
