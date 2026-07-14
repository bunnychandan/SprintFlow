"use client";

import { useState } from "react";
import { Search, ArrowUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge, PriorityBadge, TypeBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number | null;
  assignee: { id: string; name: string | null; image: string | null } | null;
  reporter: { id: string; name: string | null; image: string | null } | null;
}

interface SprintBacklogProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (taskId: string) => void;
  onMoveToBacklog?: (taskId: string) => void;
  onUpdateStoryPoints?: (taskId: string, points: number) => void;
  readOnly?: boolean;
}

export function SprintBacklog({
  tasks, loading, onTaskClick, onMoveToBacklog, onUpdateStoryPoints, readOnly,
}: SprintBacklogProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "status" | "points">("priority");

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 rounded-xl border border-border p-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-surface-hover" />
              <div className="h-3 w-1/2 rounded bg-surface-hover" />
            </div>
            <div className="h-6 w-16 rounded bg-surface-hover" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
        <Plus className="h-12 w-12 text-foreground-muted mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No Tasks in Sprint</h3>
        <p className="mt-1 text-sm text-foreground-secondary">Add tasks from the backlog to get started.</p>
      </div>
    );
  }

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const order = { HIGHEST: 0, HIGH: 1, MEDIUM: 2, LOW: 3, LOWEST: 4, CRITICAL: 0 };
    const statusOrder = { TODO: 0, IN_PROGRESS: 1, IN_REVIEW: 2, QA_TESTING: 3, BLOCKED: 4, DONE: 5, REOPENED: 2 };
    if (sortBy === "priority") return (order as any)[a.priority] - (order as any)[b.priority];
    if (sortBy === "status") return (statusOrder as any)[a.status] - (statusOrder as any)[b.status];
    if (sortBy === "points") return (b.storyPoints || 0) - (a.storyPoints || 0);
    return 0;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            placeholder="Filter tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 text-sm text-foreground-secondary">
          <ArrowUpDown className="h-4 w-4" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-sm text-foreground-secondary focus:outline-none cursor-pointer"
          >
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="points">Story Points</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-4 rounded-xl border border-border p-4 transition-colors",
              onTaskClick && "cursor-pointer hover:bg-surface-hover/50"
            )}
            onClick={() => onTaskClick?.(task.id)}
          >
            <span className="text-xs text-foreground-muted w-6 font-mono">{index + 1}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TypeBadge type={task.type} />
                <span className="text-sm font-medium text-foreground truncate">{task.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.storyPoints !== null && task.storyPoints !== undefined && (
                  <Badge variant="info" size="sm">{task.storyPoints}pts</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {task.assignee && (
                <Avatar
                  src={task.assignee.image}
                  name={task.assignee.name || ""}
                  className="h-7 w-7"
                />
              )}
              {!readOnly && onMoveToBacklog && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onMoveToBacklog(task.id); }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
