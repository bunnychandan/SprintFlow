"use client";

import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, GitBranch, Users, Archive, Plus, RefreshCw } from "lucide-react";
import type { ProjectTimelineEvent } from "@/types/project";

interface ProjectTimelineProps {
  events: ProjectTimelineEvent[];
  loading?: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: RefreshCw,
  archived: Archive,
  sprint: GitBranch,
  task: Calendar,
  member: Users,
};

const typeColors: Record<string, string> = {
  created: "text-emerald-500 bg-emerald-500/10",
  updated: "text-blue-500 bg-blue-500/10",
  archived: "text-slate-500 bg-slate-500/10",
  sprint: "text-indigo-500 bg-indigo-500/10",
  task: "text-amber-500 bg-amber-500/10",
  member: "text-violet-500 bg-violet-500/10",
};

export function ProjectTimeline({ events, loading }: ProjectTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="h-10 w-10 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-surface-hover" />
              <div className="h-3 w-32 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <RefreshCw className="h-12 w-12 text-foreground-muted mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Activity Yet</h3>
        <p className="mt-1 text-sm text-foreground-secondary">Project activity will appear here.</p>
      </div>
    );
  }

  const groupedByDate: Record<string, ProjectTimelineEvent[]> = {};
  for (const event of events) {
    const dateKey = new Date(event.date).toLocaleDateString();
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(event);
  }

  return (
    <div className="relative">
      {Object.entries(groupedByDate).map(([dateKey, dateEvents]) => (
        <div key={dateKey} className="mb-6">
          <div className="sticky top-0 z-10 mb-4 bg-surface/80 backdrop-blur-sm px-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
              {dateKey === new Date().toLocaleDateString() ? "Today" : dateKey}
            </h4>
          </div>

          <div className="space-y-3">
            {dateEvents.map((event) => {
              const Icon = typeIcons[event.type] || RefreshCw;
              const colorClass = typeColors[event.type] || typeColors.updated;

              return (
                <div key={event.id} className="flex gap-4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {event.user && (
                        <span className="font-medium">
                          {event.user.name || "Someone"}{" "}
                        </span>
                      )}
                      <span className="text-foreground-secondary">{event.description}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {event.user?.image && (
                    <Avatar src={event.user.image} name={event.user.name || ""} className="h-8 w-8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
