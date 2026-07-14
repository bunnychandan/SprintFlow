"use client";

import { cn } from "@/lib/cn";
import type { CalendarEvent } from "@/types/resources";

interface ResourceCalendarProps {
  events: CalendarEvent[];
  loading?: boolean;
  className?: string;
}

const TYPE_COLORS: Record<string, string> = {
  WORK: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  LEAVE: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  HOLIDAY: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  MEETING: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  OTHER: "bg-gray-500/20 text-gray-600 border-gray-500/30",
};

export function ResourceCalendar({ events, loading, className }: ResourceCalendarProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border p-5", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-surface-hover" />
          <div className="h-48 rounded bg-surface-hover" />
        </div>
      </div>
    );
  }

  const grouped = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className={cn("rounded-2xl border border-border", className)}>
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Calendar Events</h4>
      </div>
      {sortedDates.length === 0 ? (
        <div className="p-8 text-center text-sm text-foreground-secondary">No events in this period</div>
      ) : (
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date} className="p-4">
              <p className="text-xs font-semibold text-foreground-muted mb-2">{new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
              <div className="space-y-1.5">
                {grouped[date].map((ev) => (
                  <div key={ev.id} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs", TYPE_COLORS[ev.type] || TYPE_COLORS.OTHER)}>
                    <span className="font-medium">{ev.title}</span>
                    {ev.userName && <span className="opacity-70">- {ev.userName}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
