"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import type { Pipeline } from "@/types/devops";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface PipelineStatisticsProps {
  pipelines: Pipeline[];
  loading?: boolean;
  className?: string;
}

const PIE_COLORS = ["#34d399", "#ef4444", "#6366f1", "#94a3b8"];

export function PipelineStatistics({ pipelines, loading, className }: PipelineStatisticsProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-48 rounded bg-surface-hover" /></Card>;
  }

  const totalRuns = pipelines.reduce((s, p) => s + p.successCount + p.failureCount, 0);
  const successRuns = pipelines.reduce((s, p) => s + p.successCount, 0);
  const failedRuns = pipelines.reduce((s, p) => s + p.failureCount, 0);
  const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;

  const statusData = [
    { name: "Success", value: successRuns },
    { name: "Failed", value: failedRuns },
  ];

  const pipelineData = pipelines.map((p) => ({
    name: p.name,
    success: p.successCount,
    failed: p.failureCount,
  }));

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalRuns}</p>
          <p className="text-xs text-foreground-muted">Total Runs</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{successRate}%</p>
          <p className="text-xs text-foreground-muted">Success Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{pipelines.length}</p>
          <p className="text-xs text-foreground-muted">Pipelines</p>
        </Card>
      </div>

      <Card className="p-5">
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Success vs Failure</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Pipeline Runs</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} className="text-foreground-muted" />
              <YAxis tick={{ fontSize: 11 }} className="text-foreground-muted" />
              <Tooltip />
              <Bar dataKey="success" name="Success" fill="#34d399" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
