"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { BurndownChart as BurndownChartType } from "@/types/analytics";

interface BurndownChartProps {
  data: BurndownChartType | null;
  loading?: boolean;
  className?: string;
}

export function BurndownChart({ data, loading, className }: BurndownChartProps) {
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

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Card className={cn("p-5", className)}>
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Burndown</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">
          No sprint data available
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Burndown</h4>
      <div className="flex items-center gap-4 mb-4 text-xs text-foreground-secondary">
        <span>Total: <strong className="text-foreground">{data.totalPoints}</strong></span>
        <span>Completed: <strong className="text-foreground">{data.completedPoints}</strong></span>
        <span>Progress: <strong className="text-foreground">{data.totalPoints > 0 ? Math.round((data.completedPoints / data.totalPoints) * 100) : 0}%</strong></span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Line type="monotone" dataKey="ideal" name="Ideal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <Line type="monotone" dataKey="remaining" name="Remaining" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
