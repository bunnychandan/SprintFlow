"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AIUsageSummary } from "@/types/ai";

interface AIUsageChartProps {
  data: AIUsageSummary | null;
  loading?: boolean;
  className?: string;
}

export function AIUsageChart({ data, loading, className }: AIUsageChartProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-64 rounded bg-surface-hover" /></Card>;
  }

  if (!data || !data.daily || data.daily.length === 0) {
    return <Card className={cn("p-5", className)}><p className="text-sm text-foreground-muted text-center py-12">No usage data</p></Card>;
  }

  return (
    <Card className={cn("p-5", className)}>
      <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Daily Token Usage</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.daily} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-foreground-muted" />
            <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
            <Tooltip />
            <Bar dataKey="tokens" name="Tokens" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
