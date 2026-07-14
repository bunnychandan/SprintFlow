"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { WorkloadChart as WCType } from "@/types/analytics";

interface WorkloadChartProps {
  data: WCType | null;
  loading?: boolean;
  className?: string;
}

export function WorkloadChart({ data, loading, className }: WorkloadChartProps) {
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
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Workload Distribution</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">
          No workload data available
        </div>
      </Card>
    );
  }

  const chartData = data.data.map((d) => ({
    name: d.name || d.email?.split("@")[0],
    tasks: d.taskCount,
    points: d.storyPoints,
    completed: d.completedCount,
    overdue: d.overdueCount,
  }));

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Workload Distribution</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="text-foreground-muted" width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="tasks" name="Total Tasks" fill="#6366f1" radius={[0, 4, 4, 0]} />
            <Bar dataKey="completed" name="Completed" fill="#34d399" radius={[0, 4, 4, 0]} />
            <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
