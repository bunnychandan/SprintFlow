"use client";

import { useState } from "react";
import { Search, X, Plus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { TaskStatusBadge, TaskPriorityBadge, TaskTypeBadge } from "@/components/task/task-status-badge";
import { cn } from "@/lib/cn";

interface BacklogTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  storyPoints: number | null;
  assignee?: { name: string | null; email: string } | null;
}

interface BacklogPanelProps {
  tasks: BacklogTask[];
  sprints: Array<{ id: string; name: string }>;
  onMoveToSprint: (taskId: string, sprintId: string) => void;
  onBulkAssign?: (taskIds: string[], assigneeId: string) => void;
  onBulkEstimate?: (taskIds: string[], points: number) => void;
}

export function BacklogPanel({
  tasks,
  sprints,
  onMoveToSprint,
  onBulkAssign,
  onBulkEstimate,
}: BacklogPanelProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sprintId, setSprintId] = useState("");

  const filtered = tasks.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            placeholder="Search backlog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">{selected.size} selected</span>
            <div className="flex items-center gap-1">
              <Select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                options={[{ value: "", label: "Move to sprint..." }, ...sprints.map((s) => ({ value: s.id, label: s.name }))]}
              />
              {sprintId && (
                <Button size="sm" variant="primary" onClick={() => {
                  selected.forEach((tid) => onMoveToSprint(tid, sprintId));
                  setSelected(new Set());
                  setSprintId("");
                }}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-hover">
              <th className="w-8 px-3 py-2">
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} className="h-3.5 w-3.5 rounded border-border" />
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-foreground-secondary uppercase">Task</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-foreground-secondary uppercase">Status</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-foreground-secondary uppercase">Priority</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-foreground-secondary uppercase">Points</th>
              <th className="px-3 py-2 text-left text-[10px] font-medium text-foreground-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((task) => (
              <tr key={task.id} className={cn("transition-colors hover:bg-surface-hover", selected.has(task.id) && "bg-accent/5")}>
                <td className="px-3 py-2">
                  <input type="checkbox" checked={selected.has(task.id)} onChange={() => toggleSelect(task.id)} className="h-3.5 w-3.5 rounded border-border" />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <TaskTypeBadge type={task.type} />
                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <TaskStatusBadge status={task.status} />
                </td>
                <td className="px-3 py-2">
                  <TaskPriorityBadge priority={task.priority} />
                </td>
                <td className="px-3 py-2 text-sm text-foreground-muted">{task.storyPoints ?? "—"}</td>
                <td className="px-3 py-2">
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) onMoveToSprint(task.id, e.target.value); }}
                    className="text-xs rounded-lg border border-border bg-surface px-2 py-1 text-foreground"
                  >
                    <option value="">Move to sprint...</option>
                    {sprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-foreground-muted">
            No tasks in backlog
          </div>
        )}
      </div>
    </div>
  );
}
