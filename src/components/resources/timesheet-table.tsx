"use client";

import { cn } from "@/lib/cn";
import { TimesheetStatusBadge } from "./timesheet-status-badge";
import type { Timesheet } from "@/types/resources";

interface TimesheetTableProps {
  data: Timesheet[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  className?: string;
}

export function TimesheetTable({ data, loading, onApprove, onReject, showActions, className }: TimesheetTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>
        No timesheets found
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Week</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Hours</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Billable</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Status</th>
            {showActions && <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((ts) => (
            <tr key={ts.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3 text-sm text-foreground">{ts.userName || ts.userEmail}</td>
              <td className="px-4 py-3 text-sm text-foreground">{ts.weekStart} - {ts.weekEnd}</td>
              <td className="px-4 py-3 text-sm text-foreground">{ts.totalHours}h</td>
              <td className="px-4 py-3 text-sm text-foreground">{ts.billableHours}h</td>
              <td className="px-4 py-3"><TimesheetStatusBadge status={ts.status} /></td>
              {showActions && ts.status === "SUBMITTED" && (
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onApprove?.(ts.id)} className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">Approve</button>
                    <button onClick={() => onReject?.(ts.id)} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">Reject</button>
                  </div>
                </td>
              )}
              {showActions && ts.status !== "SUBMITTED" && <td className="px-4 py-3" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
