"use client";

import { GripVertical, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { BacklogPriorityBadge } from "./backlog-priority-badge";
import type { BacklogTask } from "@/types/agile";
import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  render?: (task: BacklogTask) => ReactNode;
}

interface BacklogTableProps {
  tasks: BacklogTask[];
  selected: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  allSelected: boolean;
}

export function BacklogTable({ tasks, selected, onSelect, onSelectAll, onDeselectAll, allSelected }: BacklogTableProps) {
  const columns: Column[] = [
    {
      key: "title",
      label: "Task",
      render: (t) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{t.title}</span>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (t) => <BacklogPriorityBadge priority={t.priority} />,
    },
    {
      key: "type",
      label: "Type",
      render: (t) => <span className="text-xs text-foreground-secondary capitalize">{t.type}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (t) => (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          t.status === "DONE" && "bg-emerald-500/10 text-emerald-600",
          t.status === "BLOCKED" && "bg-red-500/10 text-red-600",
          t.status === "IN_PROGRESS" && "bg-amber-500/10 text-amber-600",
          !["DONE","BLOCKED","IN_PROGRESS"].includes(t.status) && "bg-surface-hover text-foreground-secondary"
        )}>
          {t.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "assignee",
      label: "Assignee",
      render: (t) => (
        t.assignee ? (
          <Avatar src={t.assignee.image} name={t.assignee.name || undefined} className="h-6 w-6" />
        ) : (
          <span className="text-xs text-foreground-muted">Unassigned</span>
        )
      ),
    },
    {
      key: "storyPoints",
      label: "SP",
      render: (t) => (
        <span className="text-sm text-foreground-secondary">{t.storyPoints ?? "-"}</span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            <th className="px-3 py-3 w-10">
              <button onClick={allSelected ? onDeselectAll : onSelectAll}>
                {allSelected ? <CheckSquare className="h-4 w-4 text-accent" /> : <Square className="h-4 w-4 text-foreground-muted" />}
              </button>
            </th>
            <th className="px-1 py-3 w-6">
              <GripVertical className="h-3.5 w-3.5 text-foreground-muted" />
            </th>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className={cn(
                "transition-colors hover:bg-surface-hover/50",
                selected.has(task.id) && "bg-accent/5"
              )}
            >
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(task.id)}
                  onChange={(e) => onSelect(task.id, e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
              </td>
              <td className="px-1 py-3 text-foreground-muted">
                <GripVertical className="h-3.5 w-3.5" />
              </td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(task) : (
                    <span className="text-sm text-foreground-secondary">{(task as any)[col.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
