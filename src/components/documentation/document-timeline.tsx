"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Clock, Plus, RefreshCw, Upload, Archive, RotateCcw } from "lucide-react";
import type { DocumentTimelineEvent } from "@/types/documentation";

interface DocumentTimelineProps {
  events: DocumentTimelineEvent[];
  loading?: boolean;
  className?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <Plus className="h-4 w-4 text-emerald-500" />,
  updated: <RefreshCw className="h-4 w-4 text-blue-500" />,
  published: <Upload className="h-4 w-4 text-accent" />,
  archived: <Archive className="h-4 w-4 text-red-500" />,
  restored: <RotateCcw className="h-4 w-4 text-amber-500" />,
};

export function DocumentTimeline({ events, loading, className }: DocumentTimelineProps) {
  if (loading) {
    return <Card className={cn("p-5", className)}><div className="animate-pulse h-32 rounded bg-surface-hover" /></Card>;
  }

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wider">Timeline</h4>
      </div>
      {!events || events.length === 0 ? (
        <p className="text-sm text-foreground-muted text-center py-4">No events</p>
      ) : (
        <div className="space-y-0">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3 py-3 border-l-2 border-border pl-4 relative">
              <div className="absolute -left-[9px] bg-background p-0.5">{ACTION_ICONS[event.action] || <Clock className="h-4 w-4 text-foreground-muted" />}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground capitalize">{event.action}</p>
                <p className="text-[10px] text-foreground-muted">{event.actorName || "System"} · {new Date(event.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
