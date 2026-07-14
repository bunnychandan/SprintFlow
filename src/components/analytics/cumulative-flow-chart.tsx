"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { CumulativeFlowChart as CFCType } from "@/types/analytics";

const STATUS_COLORS = ["#94a3b8", "#818cf8", "#f59e0b", "#34d399", "#ef4444", "#6366f1"];

interface CumulativeFlowChartProps {
  data: CFCType | null;
  loading?: boolean;
  className?: string;
}

export function CumulativeFlowChart({ data, loading, className }: CumulativeFlowChartProps) {
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
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Cumulative Flow</h4>
        <div className="flex items-center justify-center h-48 text-sm text-foreground-secondary">
          No flow data available
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Cumulative Flow Diagram</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="todo" name="To Do" stackId="1" stroke={STATUS_COLORS[0]} fill={STATUS_COLORS[0]} fillOpacity={0.3} />
            <Area type="monotone" dataKey="inProgress" name="In Progress" stackId="1" stroke={STATUS_COLORS[1]} fill={STATUS_COLORS[1]} fillOpacity={0.3} />
            <Area type="monotone" dataKey="inReview" name="In Review" stackId="1" stroke={STATUS_COLORS[2]} fill={STATUS_COLORS[2]} fillOpacity={0.3} />
            <Area type="monotone" dataKey="done" name="Done" stackId="1" stroke={STATUS_COLORS[3]} fill={STATUS_COLORS[3]} fillOpacity={0.3} />
            <Area type="monotone" dataKey="blocked" name="Blocked" stackId="1" stroke={STATUS_COLORS[4]} fill={STATUS_COLORS[4]} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
