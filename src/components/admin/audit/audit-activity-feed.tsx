"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Avatar } from "@/components/ui";
import { Activity, RefreshCw } from "lucide-react";

interface ActivityEvent {
  id: string;
  action: string;
  entityType: string;
  details: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string; image: string | null; role: string } | null;
}

interface AuditActivityFeedProps {
  refreshInterval?: number;
  maxItems?: number;
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

export function AuditActivityFeed({ refreshInterval = 15000, maxItems = 50 }: AuditActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/audit/activity?limit=${maxItems}`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.logs ?? []);
    } catch {
      // silent fail for polling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [maxItems]);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchActivity();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchActivity, refreshInterval]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchActivity();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-foreground-muted/20" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-3/4 bg-foreground-muted/20 rounded" />
              <div className="h-2 w-1/2 bg-foreground-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          Live Activity
        </h3>
        <button onClick={handleManualRefresh} disabled={refreshing}
          className="text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1">
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-foreground-muted text-center py-8">No recent activity</p>
        ) : (
          events.map((event, i) => {
            const timeAgo = getTimeAgo(new Date(event.createdAt));
            return (
              <div key={event.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/5 transition-colors">
                <Avatar name={event.actor?.name ?? event.actor?.email ?? "S"} src={event.actor?.image ?? undefined} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {event.actor?.name ?? event.actor?.email ?? "System"}
                    </span>
                    <Badge variant={getActionColor(event.action)} size="sm">{event.action}</Badge>
                    {i === 0 && <span className="text-[10px] text-accent font-medium">NEW</span>}
                  </div>
                  <p className="text-[11px] text-foreground-secondary mt-0.5">
                    {event.entityType}{event.details ? ` — ${event.details.slice(0, 80)}${event.details.length > 80 ? "..." : ""}` : ""}
                  </p>
                  <p className="text-[10px] text-foreground-muted mt-0.5">{timeAgo}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
