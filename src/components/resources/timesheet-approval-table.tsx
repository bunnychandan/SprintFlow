"use client";

import { cn } from "@/lib/cn";
import { TimesheetStatusBadge } from "./timesheet-status-badge";
import type { TimesheetApproval } from "@/types/resources";

interface TimesheetApprovalTableProps {
  data: TimesheetApproval[];
  loading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

export function TimesheetApprovalTable({ data, loading, onApprove, onReject, className }: TimesheetApprovalTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border p-8 text-center text-sm text-foreground-secondary", className)}>
        No pending approvals
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
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Submitted</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((ts) => (
            <tr key={ts.id} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3 text-sm text-foreground">{ts.userName || ts.userEmail}</td>
              <td className="px-4 py-3 text-sm text-foreground">{ts.weekStart}</td>
              <td className="px-4 py-3 text-sm text-foreground">{ts.totalHours}h</td>
              <td className="px-4 py-3 text-sm text-foreground">{new Date(ts.submittedAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><TimesheetStatusBadge status={ts.status as any} /></td>
              <td className="px-4 py-3">
                {ts.status === "SUBMITTED" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onApprove?.(ts.id)} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors font-medium">Approve</button>
                    <button onClick={() => onReject?.(ts.id)} className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors font-medium">Reject</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
