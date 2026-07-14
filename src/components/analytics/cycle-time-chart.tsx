"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { CycleTimeChart as CTCType } from "@/types/analytics";

interface CycleTimeChartProps {
  data: CTCType | null;
  loading?: boolean;
  className?: string;
}

export function CycleTimeChart({ data, loading, className }: CycleTimeChartProps) {
  if (loading) {
    return (
      <Card className={cn("p-5", className)}>
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-surface-hover mb-4" />
          <div className="h-48 rounded bg-surface-hover" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={cn("p-5", className)}>
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Cycle Time</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">
          No completed tasks yet
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Cycle Time</h4>
      <div className="flex items-center gap-4 mb-4 text-xs text-foreground-secondary">
        <span>Average: <strong className="text-foreground">{data.average}d</strong></span>
        <span>Median: <strong className="text-foreground">{data.median}d</strong></span>
        <span>P95: <strong className="text-foreground">{data.p95}d</strong></span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.distribution} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
            />
            <Bar dataKey="value" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
