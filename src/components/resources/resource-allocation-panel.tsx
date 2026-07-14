"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import type { ResourceAllocation } from "@/types/resources";

interface ResourceAllocationPanelProps {
  allocations: ResourceAllocation[];
  loading?: boolean;
  className?: string;
}

const ALLOCATION_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#ef4444", "#818cf8", "#ec4899", "#14b8a6", "#8b5cf6"];

export function ResourceAllocationPanel({ allocations, loading, className }: ResourceAllocationPanelProps) {
  if (loading) {
    return (
      <Card className={cn("p-5", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-surface-hover" />
          <div className="h-32 rounded bg-surface-hover" />
        </div>
      </Card>
    );
  }

  if (!allocations || allocations.length === 0) {
    return (
      <Card className={cn("p-5", className)}>
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Allocations</h4>
        <p className="text-sm text-foreground-secondary">No allocations</p>
      </Card>
    );
  }

  const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0);

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Resource Allocations</h4>
      <div className="space-y-3">
        {allocations.map((a, i) => (
          <div key={a.id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                <span className="text-foreground font-medium">{a.projectCode} - {a.projectName}</span>
              </div>
              <span className="text-foreground-muted">{a.allocation}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${a.allocation}%`, backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
              />
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
          <span className="text-foreground-muted">Total</span>
          <span className="text-foreground font-semibold">{totalAllocation}%</span>
        </div>
      </div>
    </Card>
  );
}
