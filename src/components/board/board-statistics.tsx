"use client";

import { BarChart3, AlertTriangle, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BoardStatistics } from "@/types/board";

interface BoardStatisticsProps {
  stats: BoardStatistics;
}

const COLORS: Record<string, string> = {
  BACKLOG: "bg-gray-500",
  TODO: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  IN_REVIEW: "bg-purple-500",
  QA_TESTING: "bg-orange-500",
  BLOCKED: "bg-red-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-gray-400",
  REOPENED: "bg-rose-500",
};

export function BoardStatistics({ stats }: BoardStatisticsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <ListTodo className="h-4 w-4" />
          <span className="text-xs">Total</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">{stats.totalTasks}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <BarChart3 className="h-4 w-4" />
          <span className="text-xs">Completed</span>
        </div>
        <p className="text-2xl font-bold text-green-500 mt-1">{stats.completionPct}%</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs">Points Done</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">{stats.completedPoints}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <Clock className="h-4 w-4" />
          <span className="text-xs">Remaining</span>
        </div>
        <p className="text-2xl font-bold text-foreground mt-1">{stats.storyPointsRemaining}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">Blocked</span>
        </div>
        <p className={cn("text-2xl font-bold mt-1", stats.blockedTasks > 0 ? "text-red-500" : "text-foreground")}>
          {stats.blockedTasks}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-foreground-muted">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">Overdue</span>
        </div>
        <p className={cn("text-2xl font-bold mt-1", stats.overdueTasks > 0 ? "text-red-500" : "text-foreground")}>
          {stats.overdueTasks}
        </p>
      </div>
    </div>
  );
}
