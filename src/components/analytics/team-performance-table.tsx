"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import type { TeamPerformance } from "@/types/analytics";

interface TeamPerformanceTableProps {
  data: TeamPerformance[];
  loading?: boolean;
  className?: string;
}

export function TeamPerformanceTable({ data, loading, className }: TeamPerformanceTableProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border overflow-hidden", className)}>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-surface-hover" />
              <div className="flex-1 h-4 rounded bg-surface-hover" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-foreground-secondary">
        No team performance data available
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Member</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Completed Tasks</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Completed Points</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">In Progress</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Avg Cycle Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((member) => (
            <tr key={member.userId} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={member.image} name={member.name || member.email} className="h-8 w-8" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name || member.email}</p>
                    <p className="text-xs text-foreground-muted">{member.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{member.completedTasks}</td>
              <td className="px-4 py-3 text-sm text-foreground">{member.completedPoints}</td>
              <td className="px-4 py-3 text-sm text-foreground">{member.tasksInProgress}</td>
              <td className="px-4 py-3 text-sm text-foreground">{member.avgCycleTime}d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
