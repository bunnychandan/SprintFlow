"use client";

import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { KPIStatCards } from "@/components/analytics/kpi-stat-cards";
import { VelocityChart } from "@/components/analytics/velocity-chart";
import { TeamPerformanceTable } from "@/components/analytics/team-performance-table";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { useProjectAnalytics } from "@/hooks/use-analytics";

const PIE_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#ef4444", "#94a3b8", "#818cf8"];
const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8",
  in_progress: "#6366f1",
  in_review: "#f59e0b",
  done: "#34d399",
  blocked: "#ef4444",
  backlog: "#818cf8",
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#6366f1",
  low: "#94a3b8",
};
const TYPE_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#ef4444", "#818cf8"];

export default function ProjectAnalyticsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { data, loading, refetch } = useProjectAnalytics(projectId);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <AnalyticsEmptyState title="No Project Data" description="This project has no analytics data yet." />;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.projectName}</h1>
        <p className="text-sm text-foreground-secondary">{data.projectCode} — Project Analytics</p>
      </header>

      <div className="space-y-6">
        <KPIStatCards kpis={data.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Task Status</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.taskDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70} label={({ payload }) => `${payload.status} (${payload.count})`}>
                    {data.taskDistribution.map((entry, i) => (
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
                  <Pie data={data.priorityDistribution} dataKey="count" nameKey="priority" cx="50%" cy="50%" outerRadius={70} label={({ payload }) => `${payload.priority} (${payload.count})`}>
                    {data.priorityDistribution.map((entry, i) => (
                      <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Type</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.typeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={({ payload }) => `${payload.type} (${payload.count})`}>
                    {data.typeDistribution.map((entry, i) => (
                      <Cell key={entry.type} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <VelocityChart data={data.sprintVelocity} />

        <div>
          <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Team Performance</h4>
          <TeamPerformanceTable data={data.teamPerformance} />
        </div>
      </div>
    </main>
  );
}
