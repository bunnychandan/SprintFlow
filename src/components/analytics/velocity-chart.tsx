"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { VelocityDataPoint } from "@/types/analytics";

interface VelocityChartProps {
  data: VelocityDataPoint[];
  loading?: boolean;
  className?: string;
}

export function VelocityChart({ data, loading, className }: VelocityChartProps) {
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
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Sprint Velocity</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">
          No completed sprints yet
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Sprint Velocity</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="sprint" tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Bar dataKey="committedPoints" name="Committed" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completedPoints" name="Completed" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
