"use client";

import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import type { ResourceAvailability } from "@/types/resources";

interface AvailabilityCalendarProps {
  data: ResourceAvailability[];
  loading?: boolean;
  className?: string;
}

export function AvailabilityCalendar({ data, loading, className }: AvailabilityCalendarProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border p-5", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 rounded bg-surface-hover" />
          <div className="h-48 rounded bg-surface-hover" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-border p-5 text-center text-sm text-foreground-secondary", className)}>
        No availability data
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Resource</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Capacity</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Allocated</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Available</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Utilization</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">Leave</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((r) => (
            <tr key={r.userId} className="hover:bg-surface-hover/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar src={r.image} name={r.name || r.email} className="h-8 w-8" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name || r.email}</p>
                    <p className="text-xs text-foreground-muted">{r.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{r.totalCapacity}h</td>
              <td className="px-4 py-3 text-sm text-foreground">{Math.round(r.allocated)}h</td>
              <td className="px-4 py-3 text-sm">
                <span className={cn("font-medium", r.available > 0 ? "text-emerald-500" : "text-red-500")}>{Math.round(r.available)}h</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-surface-hover overflow-hidden">
                    <div className={cn("h-full rounded-full", r.utilization > 80 ? "bg-red-500" : r.utilization > 60 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.min(r.utilization, 100)}%` }} />
                  </div>
                  <span className="text-xs text-foreground-muted">{r.utilization}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{r.leaveDays}d</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
