"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { ReleaseStatusBadge } from "./release-status-badge";
import type { ReleaseListItem } from "@/types/agile";
import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (release: ReleaseListItem) => ReactNode;
}

interface ReleaseTableProps {
  releases: ReleaseListItem[];
  sortBy?: string;
  sortDirection?: string;
  onSort?: (key: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected: Set<string>;
}

export function ReleaseTable({ releases, sortBy, sortDirection, onSort, onSelect, selected }: ReleaseTableProps) {
  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <span className="text-xs font-bold">{r.project.code?.[0] || "R"}</span>
          </div>
          <div className="min-w-0">
            <Link href={`/releases/${r.id}`} className="font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
              {r.name}
            </Link>
            <p className="text-xs text-foreground-secondary">
              {r.project.name}
              {r.version && <span> &middot; v{r.version}</span>}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (r) => <ReleaseStatusBadge status={r.status} />,
    },
    {
      key: "targetDate",
      label: "Target Date",
      sortable: true,
      render: (r) => (
        <span className="text-sm text-foreground-secondary">
          {r.targetDate ? new Date(r.targetDate).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "releasedAt",
      label: "Released",
      sortable: true,
      render: (r) => (
        <span className="text-sm text-foreground-secondary">
          {r.releasedAt ? new Date(r.releasedAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "tasks",
      label: "Tasks",
      render: (r) => (
        <span className="text-sm text-foreground">{r._count?.tasks ?? 0}</span>
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
                  checked={releases.length > 0 && selected.size === releases.length}
                  onChange={(e) => { if (onSelect) releases.forEach((r) => onSelect(r.id, e.target.checked)); }}
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
          {releases.map((release) => (
            <tr
              key={release.id}
              className={cn(
                "transition-colors hover:bg-surface-hover/50",
                selected.has(release.id) && "bg-accent/5"
              )}
            >
              {onSelect && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(release.id)}
                    onChange={(e) => onSelect(release.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(release) : (
                    <span className="text-sm text-foreground-secondary">{(release as any)[col.key]}</span>
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
