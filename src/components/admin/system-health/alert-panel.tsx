"use client";

import { Card, Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Bell, AlertTriangle, Info, XCircle, CheckCircle2 } from "lucide-react";
import type { AlertItem, AlertSeverityType } from "@/types/admin";

interface AlertPanelProps {
  alerts: AlertItem[];
  onResolve?: (id: string) => void;
  loading?: boolean;
  className?: string;
}

const severityConfig: Record<AlertSeverityType, { icon: React.ElementType; color: string; bg: string }> = {
  INFO: { icon: Info, color: "text-info", bg: "bg-info/10" },
  WARNING: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  CRITICAL: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export function AlertPanel({ alerts, onResolve, loading, className }: AlertPanelProps) {
  if (loading) {
    return (
      <Card className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-foreground-muted" />
          <h3 className="text-sm font-semibold text-foreground">Alerts</h3>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-surface-hover/50">
            <div className="h-8 w-8 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-surface-hover rounded" />
              <div className="h-3 w-1/2 bg-surface-hover rounded" />
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <CheckCircle2 className="h-10 w-10 text-success mb-3" />
        <p className="text-sm font-medium text-foreground">No Active Alerts</p>
        <p className="text-xs text-foreground-muted mt-1">All systems are operating normally</p>
      </Card>
    );
  }

  return (
    <Card className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-foreground-muted" />
          <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
          <Badge variant="danger" size="sm">{alerts.length}</Badge>
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity as AlertSeverityType] || severityConfig.INFO;
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border border-border/50 transition-colors",
                "hover:bg-surface-hover/50 group"
              )}
            >
              <div className={cn("shrink-0 flex h-8 w-8 items-center justify-center rounded-full", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <Badge variant={alert.status === "ACTIVE" ? "warning" : "neutral"} size="sm">
                    {alert.status}
                  </Badge>
                </div>
                {alert.description && (
                  <p className="text-xs text-foreground-secondary mt-0.5 line-clamp-2">{alert.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-foreground-muted">{alert.source}</span>
                  <span className="text-[10px] text-foreground-muted">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              {alert.status === "ACTIVE" && onResolve && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-accent hover:text-accent-hover font-medium"
                >
                  Resolve
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
