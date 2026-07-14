"use client";

import Link from "next/link";
import { Calendar, ListTodo, Users, ArrowRight, GitBranch } from "lucide-react";
import { cn } from "@/lib/cn";
import { SprintStatusBadge } from "./sprint-status-badge";
import type { SprintListItem } from "@/types/sprint";

interface SprintCardProps {
  sprint: SprintListItem;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
}

export function SprintCard({ sprint, onSelect, selected }: SprintCardProps) {
  const taskCount = (sprint as any)._count?.tasks ?? 0;
  const completedTasks = (sprint as any).completedTasks ?? 0;
  const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-surface p-5 transition-all duration-200",
        selected ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(sprint.id, e.target.checked)}
          className="absolute left-3 top-3 h-4 w-4 rounded border-border"
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <Link
              href={`/sprints/${sprint.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
            >
              {sprint.name}
            </Link>
            <p className="text-xs text-foreground-secondary mt-0.5">{sprint.project.name}</p>
          </div>
        </div>
      </div>

      {sprint.goal && (
        <p className="mt-3 text-sm text-foreground-secondary line-clamp-2 italic">&ldquo;{sprint.goal}&rdquo;</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <SprintStatusBadge status={sprint.status} />
      </div>

      {taskCount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-foreground-secondary mb-1.5">
            <span>{completedTasks}/{taskCount} tasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-foreground-secondary">
          {sprint.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(sprint.startDate).toLocaleDateString()}
            </span>
          )}
          <span className="flex items-center gap-1">
            <ListTodo className="h-3.5 w-3.5" />
            {taskCount}
          </span>
        </div>

        <Link
          href={`/sprints/${sprint.id}`}
          className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
