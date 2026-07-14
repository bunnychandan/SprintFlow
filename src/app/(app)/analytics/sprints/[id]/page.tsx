"use client";

import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { KPIStatCards } from "@/components/analytics/kpi-stat-cards";
import { BurndownChart } from "@/components/analytics/burndown-chart";
import { BurnupChart } from "@/components/analytics/burnup-chart";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { useSprintAnalytics, useBurndown, useBurnup } from "@/hooks/use-analytics";

const PIE_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#ef4444", "#94a3b8", "#818cf8"];
const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8", in_progress: "#6366f1", in_review: "#f59e0b", done: "#34d399", blocked: "#ef4444", backlog: "#818cf8",
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f59e0b", medium: "#6366f1", low: "#94a3b8",
};

export default function SprintAnalyticsPage() {
  const params = useParams();
  const sprintId = params?.id as string;

  const { data: sprint, loading: sprintLoading, refetch } = useSprintAnalytics(sprintId);
  const { data: burndown, loading: burndownLoading } = useBurndown(sprintId);
  const { data: burnup, loading: burnupLoading } = useBurnup(sprintId);

  if (sprintLoading) return <AnalyticsSkeleton />;
  if (!sprint) return <AnalyticsEmptyState title="No Sprint Data" description="This sprint has no analytics data yet." />;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{sprint.sprintName}</h1>
        <p className="text-sm text-foreground-secondary">Sprint Analytics</p>
      </header>

      <div className="space-y-6">
        <KPIStatCards kpis={sprint.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BurndownChart data={burndown} loading={burndownLoading} />
          <BurnupChart data={burnup} loading={burnupLoading} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Task Status</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sprint.taskDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ payload }) => `${payload.status} (${payload.count})`}>
                    {sprint.taskDistribution.map((entry, i) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Priority</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sprint.priorityDistribution} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={70} label={({ payload }) => `${payload.priority} (${payload.count})`}>
                    {sprint.priorityDistribution.map((entry, i) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Assignee Distribution</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sprint.assigneeDistribution.map((a) => (
                <div key={a.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar src={a.image} name={a.name || a.email} className="h-6 w-6" />
                    <span className="text-foreground">{a.name || a.email}</span>
                  </div>
                  <span className="text-foreground-muted">{a.taskCount} tasks ({a.storyPoints} SP)</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
