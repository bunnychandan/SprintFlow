"use client";

import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { ResourceReportTable } from "@/components/resources/resource-report-table";
import { ResourceExportDialog } from "@/components/resources/resource-export-dialog";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";
import { CapacityChart } from "@/components/resources/capacity-chart";
import { UtilizationChart } from "@/components/resources/utilization-chart";
import { useResourceReports, useCapacity, useReportExport } from "@/hooks/use-resources";

const PERIODS = [
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

export default function ResourceReportsPage() {
  const [period, setPeriod] = useState("30");
  const [isExportOpen, setIsExportOpen] = useState(false);

  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: reports, loading, error, refetch } = useResourceReports({ dateFrom: from, dateTo: to });
  const { data: capacity } = useCapacity({ dateFrom: from, dateTo: to });
  const { doExport, exporting } = useReportExport();

  const handleExport = useCallback(async (format: "csv" | "json") => {
    const result = await doExport({ dateFrom: from, dateTo: to, format });
    if (result instanceof Blob) {
      const url = URL.createObjectURL(result);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resource-report-${from}-${to}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsExportOpen(false);
  }, [doExport, from, to]);

  if (error) return <ErrorState title="Failed to load reports" message={error} onRetry={refetch} />;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Resource Reports"
        subtitle="Utilization, capacity, and time reports."
        metadata="Enterprise Analytics"
        actions={
          <Button variant="gradient" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => setIsExportOpen(true)}>
            Export
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p.value ? "bg-accent-light text-accent" : "bg-surface-hover text-foreground-secondary hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CapacityChart data={capacity} />
              <UtilizationChart data={capacity} />
            </div>

            <ResourceReportTable data={reports} />
          </>
        )}
      </div>

      <ResourceExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        exporting={exporting}
      />
    </main>
  );
}
