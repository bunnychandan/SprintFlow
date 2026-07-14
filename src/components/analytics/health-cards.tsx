"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { ArrowRight, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { ProjectHealth, SprintHealth, ReleaseHealth, EpicHealth } from "@/types/analytics";

const healthConfig = {
  good: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  critical: { icon: Info, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export function ProjectHealthCard({ data }: { data: ProjectHealth }) {
  const cfg = healthConfig[data.health] || healthConfig.good;
  const Icon = cfg.icon;

  return (
    <Link href={`/analytics/projects/${data.projectId}`}>
      <Card className={cn("p-4 border", cfg.border, "hover:shadow-md transition-all cursor-pointer")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.bg)}>
              <Icon className={cn("h-5 w-5", cfg.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{data.projectName}</p>
              <p className="text-xs text-foreground-muted">{data.projectCode}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-foreground-secondary">
          <span>{data.completionPct}% done</span>
          <span>{data.overdueTasks} overdue</span>
          <span>{data.blockedTasks} blocked</span>
        </div>
      </Card>
    </Link>
  );
}

export function SprintHealthCard({ data }: { data: SprintHealth }) {
  const cfg = healthConfig[data.health] || healthConfig.good;
  const Icon = cfg.icon;

  return (
    <Link href={`/analytics/sprints/${data.sprintId}`}>
      <Card className={cn("p-4 border", cfg.border, "hover:shadow-md transition-all cursor-pointer")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.bg)}>
              <Icon className={cn("h-5 w-5", cfg.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{data.sprintName}</p>
              <p className="text-xs text-foreground-muted">{data.daysRemaining}d remaining</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-foreground-secondary mb-1">
            <span>{data.completionPct}%</span>
            <span>{data.pointsCompleted}/{data.pointsTotal} SP</span>
          </div>
          <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", data.health === "good" ? "bg-emerald-500" : data.health === "warning" ? "bg-amber-500" : "bg-red-500")} style={{ width: `${Math.min(data.completionPct, 100)}%` }} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function ReleaseHealthCard({ data }: { data: ReleaseHealth }) {
  const cfg = healthConfig[data.health] || healthConfig.good;
  const Icon = cfg.icon;

  return (
    <Link href={`/analytics/releases/${data.releaseId}`}>
      <Card className={cn("p-4 border", cfg.border, "hover:shadow-md transition-all cursor-pointer")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.bg)}>
              <Icon className={cn("h-5 w-5", cfg.color)} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{data.releaseName}</p>
              {data.version && <p className="text-xs text-foreground-muted">v{data.version}</p>}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-foreground-secondary">
          <span>{data.completionPct}% done</span>
          <span>{data.tasksCompleted}/{data.tasksTotal} tasks</span>
          <span>{data.daysUntilTarget !== null ? `${data.daysUntilTarget}d left` : "No target"}</span>
        </div>
      </Card>
    </Link>
  );
}

export function EpicHealthCard({ data }: { data: EpicHealth }) {
  const cfg = healthConfig[data.health] || healthConfig.good;
  const Icon = cfg.icon;

  return (
    <Link href={`/analytics/epics/${data.epicId}`}>
      <Card className={cn("p-4 border", cfg.border, "hover:shadow-md transition-all cursor-pointer")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", cfg.bg)}>
              <Icon className={cn("h-5 w-5", cfg.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.epicColor }} />
                <p className="text-sm font-semibold text-foreground">{data.epicTitle}</p>
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground-muted" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-foreground-secondary">
          <span>{data.completionPct}% done</span>
          <span>{data.completedTasks}/{data.taskCount} tasks</span>
          <span>{data.daysUntilTarget !== null ? `${data.daysUntilTarget}d left` : "No target"}</span>
        </div>
      </Card>
    </Link>
  );
}
