"use client";

import { cn } from "@/lib/cn";
import type { ResourceReport } from "@/types/resources";

interface ResourceReportTableProps {
  data: ResourceReport | null;
  loading?: boolean;
  className?: string;
}

export function ResourceReportTable({ data, loading, className }: ResourceReportTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>
        No report data available
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Total Hours</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Billable</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Non-Billable</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Utilization</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Overtime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.data.map((row) => (
            <tr key={row.userId} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-foreground">{row.name || row.email}</p>
                <p className="text-xs text-foreground-muted">{row.email}</p>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{row.totalHours}h</td>
              <td className="px-4 py-3 text-sm text-foreground">{row.billableHours}h</td>
              <td className="px-4 py-3 text-sm text-foreground">{row.nonBillableHours}h</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-12 rounded-full bg-surface-hover overflow-hidden">
                    <div className={cn("h-full rounded-full", row.utilization > 80 ? "bg-red-500" : row.utilization > 60 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(row.utilization, 100)}%` }} />
                  </div>
                  <span className="text-xs text-foreground-muted">{row.utilization}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={cn(row.overtimeHours > 0 ? "text-red-500" : "text-foreground-muted")}>{row.overtimeHours > 0 ? `${row.overtimeHours}h` : "-"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
