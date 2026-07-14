"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { EpicStatusBadge } from "./epic-status-badge";
import { EpicPriorityBadge } from "./epic-priority-badge";
import type { EpicListItem } from "@/types/agile";
import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (epic: EpicListItem) => ReactNode;
}

interface EpicTableProps {
  epics: EpicListItem[];
  sortBy?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected: Set<string>;
}

export function EpicTable({ epics, sortBy, sortDirection, onSort, onSelect, selected }: EpicTableProps) {
  const columns: Column[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (e) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${e.color}20`, color: e.color }}
          >
            <span className="text-xs font-bold">{e.project.code?.[0] || "E"}</span>
          </div>
          <div className="min-w-0">
            <Link href={`/epics/${e.id}`} className="font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
              {e.title}
            </Link>
            <p className="text-xs text-foreground-secondary">{e.project.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (e) => <EpicStatusBadge status={e.status} />,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (e) => <EpicPriorityBadge priority={e.priority} />,
    },
    {
      key: "targetDate",
      label: "Target Date",
      sortable: true,
      render: (e) => (
        <span className="text-sm text-foreground-secondary">
          {e.targetDate ? new Date(e.targetDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "tasks",
      label: "Tasks",
      render: (e) => (
        <span className="text-sm text-foreground">{e._count?.tasks ?? 0}</span>
      ),
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
                  checked={epics.length > 0 && selected.size === epics.length}
                  onChange={(e) => { if (onSelect) epics.forEach((s) => onSelect(s.id, e.target.checked)); }}
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
          {epics.map((epic) => (
            <tr
              key={epic.id}
              className={cn(
                "transition-colors hover:bg-surface-hover/50",
                selected.has(epic.id) && "bg-accent/5"
              )}
            >
              {onSelect && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(epic.id)}
                    onChange={(e) => onSelect(epic.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(epic) : (
                    <span className="text-sm text-foreground-secondary">{(epic as any)[col.key]}</span>
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
