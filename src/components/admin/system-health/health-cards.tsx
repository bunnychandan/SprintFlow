"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { HealthStatusType } from "@/types/admin";

interface HealthCardProps {
  name: string;
  status: HealthStatusType;
  label: string;
  className?: string;
}

const statusConfig = {
  HEALTHY: {
    icon: CheckCircle2,
    bg: "bg-success/10 border-success/20",
    text: "text-success",
    dot: "bg-success",
  },
  WARNING: {
    icon: AlertTriangle,
    bg: "bg-warning/10 border-warning/20",
    text: "text-warning",
    dot: "bg-warning",
  },
  CRITICAL: {
    icon: XCircle,
    bg: "bg-destructive/10 border-destructive/20",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  UNKNOWN: {
    icon: HelpCircle,
    bg: "bg-foreground-muted/10 border-foreground-muted/20",
    text: "text-foreground-muted",
    dot: "bg-foreground-muted",
  },
};

export function HealthCard({ name, status, label, className }: HealthCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn("flex items-center gap-4", config.bg, className)}>
      <div className={cn("shrink-0 flex h-10 w-10 items-center justify-center rounded-full", config.bg)}>
        <Icon className={cn("h-5 w-5", config.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className={cn("text-xs mt-0.5", config.text)}>{label}</p>
      </div>
      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", config.dot)} />
    </Card>
  );
}

export function HealthCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export function HealthCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-surface-hover shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-surface-hover rounded" />
        <div className="h-3 w-32 bg-surface-hover rounded" />
      </div>
      <div className="h-2.5 w-2.5 rounded-full bg-surface-hover shrink-0" />
    </div>
  );
}
