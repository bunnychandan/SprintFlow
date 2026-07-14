"use client";

import { cn } from "@/lib/cn";
import { Card, StatCard } from "@/components/ui/card";
import { ListTodo, CheckCircle2, AlertCircle, Timer, Target, TrendingUp, Ban } from "lucide-react";
import type { EpicStatistics } from "@/types/agile";

interface EpicStatsProps {
  stats: EpicStatistics | null;
  loading?: boolean;
  className?: string;
}

export function EpicStatistics({ stats, loading, className }: EpicStatsProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-surface-hover" />
            <div className="mt-2 h-8 w-16 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total Tasks", value: stats.totalTasks, icon: ListTodo, color: "text-blue-500" },
    { label: "Completed", value: stats.completedTasks, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Blocked", value: stats.blockedTasks, icon: AlertCircle, color: "text-red-500" },
    { label: "Overdue", value: stats.overdueTasks, icon: Ban, color: "text-rose-500" },
    { label: "Story Points", value: stats.totalStoryPoints, icon: Target, color: "text-indigo-500" },
    { label: "Completed Points", value: stats.completedStoryPoints, icon: TrendingUp, color: "text-violet-500" },
  ];

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {statCards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={<card.icon className={cn("h-5 w-5", card.color)} />}
        />
      ))}

      <Card className="col-span-full p-4">
        <h4 className="text-sm font-semibold text-foreground-secondary mb-3">Completion</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full bg-surface-hover overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(stats.completionPct, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.completionPct}%</span>
        </div>
      </Card>
    </div>
  );
}
