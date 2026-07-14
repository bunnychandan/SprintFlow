"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { WorkloadSummary } from "@/types/resources";

interface WorkloadChartProps {
  data: WorkloadSummary[];
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

  if (!data || data.length === 0) {
    return (
      <Card className={cn("p-5", className)}>
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Workload</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">No workload data</div>
      </Card>
    );
  }

  const chartData = data.map((r) => ({
    name: r.name || r.email.split("@")[0],
    "In Progress": r.inProgressTasks,
    Completed: r.completedTasks,
    Overdue: r.overdueTasks,
  }));

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Task Workload</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Completed" fill="#34d399" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
