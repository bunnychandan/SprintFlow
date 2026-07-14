"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/cn";
import { SprintStatusBadge } from "./sprint-status-badge";
import type { SprintListItem } from "@/types/sprint";
import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (sprint: SprintListItem) => ReactNode;
}

interface SprintTableProps {
  sprints: SprintListItem[];
  sortBy?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected: Set<string>;
}

export function SprintTable({ sprints, sortBy, sortDirection, onSort, onSelect, selected }: SprintTableProps) {
  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <Link href={`/sprints/${s.id}`} className="font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
              {s.name}
            </Link>
            <p className="text-xs text-foreground-secondary">{s.project.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (s) => <SprintStatusBadge status={s.status} />,
    },
    {
      key: "startDate",
      label: "Start Date",
      sortable: true,
      render: (s) => (
        <span className="text-sm text-foreground-secondary">
          {s.startDate ? new Date(s.startDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      sortable: true,
      render: (s) => (
        <span className="text-sm text-foreground-secondary">
          {s.endDate ? new Date(s.endDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "tasks",
      label: "Tasks",
      render: (s) => (
        <span className="text-sm text-foreground">
          {(s as any).completedTasks ?? 0}/{(s as any)._count?.tasks ?? 0}
        </span>
      ),
    },
    {
      key: "progress",
      label: "Progress",
      render: (s) => {
        const total = (s as any)._count?.tasks ?? 0;
        const done = (s as any).completedTasks ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 rounded-full bg-surface-hover overflow-hidden">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-foreground-secondary">{pct}%</span>
          </div>
        );
      },
    },
  ];

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return null;
    return (
      <span className="ml-1 text-accent">
        {sortDirection === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            {onSelect && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={sprints.length > 0 && selected.size === sprints.length}
                  onChange={(e) => { if (onSelect) sprints.forEach((s) => onSelect(s.id, e.target.checked)); }}
                  className="h-4 w-4 rounded border-border"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-secondary",
                  col.sortable && "cursor-pointer select-none hover:text-foreground"
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                {col.label}
                {renderSortIcon(col.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sprints.map((sprint) => (
            <tr
              key={sprint.id}
              className={cn(
                "transition-colors hover:bg-surface-hover/50",
                selected.has(sprint.id) && "bg-accent/5"
              )}
            >
              {onSelect && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(sprint.id)}
                    onChange={(e) => onSelect(sprint.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(sprint) : (
                    <span className="text-sm text-foreground-secondary">{(sprint as any)[col.key]}</span>
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
