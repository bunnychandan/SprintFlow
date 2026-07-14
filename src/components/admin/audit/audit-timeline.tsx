"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Clock } from "lucide-react";
import { Badge } from "@/components/ui";

interface TimelineEvent {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actor: { name: string | null; email: string } | null;
  entityType: string;
}

interface AuditTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

function groupEvents(events: TimelineEvent[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, TimelineEvent[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  for (const event of events) {
    const d = new Date(event.createdAt);
    if (d >= today) groups.Today.push(event);
    else if (d >= yesterday) groups.Yesterday.push(event);
    else if (d >= weekAgo) groups["This Week"].push(event);
    else groups.Earlier.push(event);
  }

  return Object.entries(groups).filter(([, evts]) => evts.length > 0);
}

const ACTION_COLORS: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  CREATE: "success",
  UPDATE: "warning",
  DELETE: "danger",
  REVOKE: "danger",
  CANCEL: "neutral",
};

function getActionColor(action: string): "success" | "warning" | "danger" | "neutral" {
  for (const [prefix, color] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(prefix)) return color;
  }
  return "neutral";
}

export function AuditTimeline({ events, loading }: AuditTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const groups = useMemo(() => groupEvents(events), [events]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="h-4 w-4 rounded-full bg-foreground-muted/20 mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-foreground-muted/20 rounded" />
              <div className="h-3 w-1/2 bg-foreground-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-foreground-muted">
        <Clock className="h-5 w-5 mr-2" />
        <span className="text-sm">No audit events yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(([groupName, groupEvents]) => (
        <div key={groupName}>
          <h3 className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">
            {groupName}
          </h3>
          <div className="space-y-1">
            {groupEvents.map((event) => {
              const isExpanded = expandedId === event.id;
              return (
                <div key={event.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full flex items-start gap-3 rounded-lg p-3 text-left hover:bg-accent/5 transition-colors"
                  >
                    <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      getActionColor(event.action) === "danger" ? "bg-destructive" :
                      getActionColor(event.action) === "success" ? "bg-success" :
                      getActionColor(event.action) === "warning" ? "bg-warning" : "bg-foreground-muted"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">
                          {event.actor?.name ?? event.actor?.email ?? "System"}
                        </span>
                        <Badge variant={getActionColor(event.action)} size="sm">{event.action}</Badge>
                        <span className="text-xs text-foreground-muted">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {event.entityType && (
                        <p className="text-xs text-foreground-secondary mt-0.5">
                          {event.entityType}{event.details ? ` — ${event.details}` : ""}
                        </p>
                      )}
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-foreground-muted flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-foreground-muted flex-shrink-0" />}
                  </button>
                  {isExpanded && event.details && (
                    <div className="ml-7 mb-2 rounded-lg border border-border bg-surface p-3 text-xs text-foreground-secondary">
                      {event.details}
                    </div>
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
