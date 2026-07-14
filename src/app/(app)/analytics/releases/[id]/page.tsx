"use client";

import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { KPIStatCards } from "@/components/analytics/kpi-stat-cards";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { useReleaseAnalytics } from "@/hooks/use-analytics";

const STATUS_COLORS: Record<string, string> = {
  todo: "#94a3b8", in_progress: "#6366f1", in_review: "#f59e0b", done: "#34d399", blocked: "#ef4444", backlog: "#818cf8",
};

export default function ReleaseAnalyticsPage() {
  const params = useParams();
  const releaseId = params?.id as string;

  const { data, loading, refetch } = useReleaseAnalytics(releaseId);

  if (loading) return <AnalyticsSkeleton />;
  if (!data) return <AnalyticsEmptyState title="No Release Data" description="This release has no analytics data yet." />;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.releaseName}</h1>
        <p className="text-sm text-foreground-secondary">{data.version ? `v${data.version} — ` : ""}Release Analytics</p>
      </header>

      <div className="space-y-6">
        <KPIStatCards kpis={data.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Task Status</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.taskDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ payload }) => `${payload.status} (${payload.count})`}>
                    {data.taskDistribution.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Progress</h4>
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                  <circle
                    cx="64" cy="64" r="56"
                    fill="none"
                    stroke={data.completionPct >= 75 ? "#34d399" : data.completionPct >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 56 * data.completionPct / 100} ${2 * Math.PI * 56 * (1 - data.completionPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{Math.round(data.completionPct)}%</span>
                </div>
              </div>
              <div className="text-sm text-foreground-secondary space-y-1 text-center">
                <p>{data.completedPoints} / {data.totalPoints} story points</p>
                {data.daysUntilTarget !== null && (
                  <p>{data.daysUntilTarget >= 0 ? `${data.daysUntilTarget} days until target` : `${Math.abs(data.daysUntilTarget)} days overdue`}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
