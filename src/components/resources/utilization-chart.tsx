"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { ResourceCapacity } from "@/types/resources";

interface UtilizationChartProps {
  data: ResourceCapacity[];
  loading?: boolean;
  className?: string;
}

export function UtilizationChart({ data, loading, className }: UtilizationChartProps) {
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
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Utilization</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">No utilization data</div>
      </Card>
    );
  }

  const chartData = data.map((r) => ({
    name: r.name || r.email.split("@")[0],
    utilization: r.utilization,
    remaining: 100 - r.utilization,
  }));

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Team Utilization</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="text-foreground-muted" width={80} />
            <Tooltip contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="utilization" name="Utilized %" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} />
            <Bar dataKey="remaining" name="Available %" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
