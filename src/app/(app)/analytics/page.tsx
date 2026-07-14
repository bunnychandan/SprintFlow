"use client";

import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { KPIStatCards } from "@/components/analytics/kpi-stat-cards";
import { VelocityChart } from "@/components/analytics/velocity-chart";
import { WorkloadChart } from "@/components/analytics/workload-chart";
import { TeamPerformanceTable } from "@/components/analytics/team-performance-table";
import { CumulativeFlowChart } from "@/components/analytics/cumulative-flow-chart";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { AnalyticsExportDialog } from "@/components/analytics/analytics-export-dialog";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { useDashboardAnalytics, useVelocity, useWorkload, useTeamAnalytics, useCumulativeFlow, useExportAnalytics } from "@/hooks/use-analytics";
import type { ExportPayload } from "@/types/analytics";

export default function AnalyticsDashboardPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const filters = {
    dateRange: dateFrom || dateTo ? { from: dateFrom || undefined, to: dateTo || undefined } : undefined,
  };

  const { data: dashboard, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useDashboardAnalytics(filters);
  const { data: velocityData, loading: velocityLoading } = useVelocity(filters);
  const { data: workload, loading: workloadLoading } = useWorkload(filters);
  const { data: teamData, loading: teamLoading } = useTeamAnalytics(filters);
  const { data: cfd, loading: cfdLoading } = useCumulativeFlow();
  const { doExport, exporting } = useExportAnalytics();

  const hasActiveFilters = !!(dateFrom || dateTo);

  const handleClearFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }, []);

  const handleExport = useCallback(async (format: "csv" | "json", type: string) => {
    const result = await doExport({ format, type: type as ExportPayload["type"], filters });
    if (result instanceof Blob) {
      const url = URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${type}-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExportOpen(false);
  }, [doExport, filters]);

  const loading = dashboardLoading || velocityLoading || workloadLoading || teamLoading || cfdLoading;

  if (loading) return <AnalyticsSkeleton />;

  if (dashboardError) {
    return (
      <ErrorState
        title="Failed to load analytics"
        message={dashboardError}
        onRetry={refetchDashboard}
      />
    );
  }

  if (!dashboard) {
    return <AnalyticsEmptyState />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Organization-wide metrics, trends, and team performance insights."
        metadata="Enterprise Analytics"
        actions={
          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => setIsExportOpen(true)}
          >
            Export
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <AnalyticsFilters
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <KPIStatCards kpis={dashboard.kpis} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VelocityChart data={dashboard.velocityTrend} />
          <CumulativeFlowChart data={cfd} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkloadChart data={workload} />
          <div>
            <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider mb-4">Team Performance</h4>
            <TeamPerformanceTable data={teamData} />
          </div>
        </div>
      </div>

      <AnalyticsExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        exporting={exporting}
      />
    </main>
  );
}
