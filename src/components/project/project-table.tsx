"use client";

import Link from "next/link";
import { Star, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProjectStatusBadge } from "./project-status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { ProjectListItem, SortDirection } from "@/types/project";
import type { ReactNode } from "react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (project: ProjectListItem) => ReactNode;
}

interface ProjectTableProps {
  projects: ProjectListItem[];
  sortBy?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  onToggleFavorite: (id: string, favorited: boolean) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected: Set<string>;
}

export function ProjectTable({
  projects,
  sortBy,
  sortDirection,
  onSort,
  onToggleFavorite,
  onSelect,
  selected,
}: ProjectTableProps) {
  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: p.color || "#2563eb" }}
          >
            {p.code?.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <Link href={`/projects/${p.id}`} className="font-medium text-foreground hover:text-accent transition-colors line-clamp-1">
              {p.name}
            </Link>
            <p className="text-xs text-foreground-secondary">{p.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => <ProjectStatusBadge status={p.status} />,
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (p) => (
        <span className="text-sm capitalize text-foreground-secondary">{p.visibility.toLowerCase()}</span>
      ),
    },
    {
      key: "members",
      label: "Members",
      render: (p) => (
        <div className="flex items-center -space-x-2">
          {(p.members || []).slice(0, 3).map((m) => (
            <Avatar
              key={m.userId}
              src={m.user.image}
              name={m.user.name || m.user.email}
              className="h-7 w-7 border-2 border-surface"
            />
          ))}
          {p.members && p.members.length > 3 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-hover text-xs font-medium text-foreground-secondary border-2 border-surface">
              +{p.members.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (p) => (
        <span className="text-sm text-foreground-secondary">{new Date(p.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(p.id, !p.isFavorited); }}
            className={cn("p-1.5 rounded-lg transition-colors hover:bg-surface-hover", p.isFavorited && "text-amber-400")}
          >
            <Star className={cn("h-4 w-4", p.isFavorited && "fill-amber-400")} />
          </button>
        </div>
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
                  checked={projects.length > 0 && selected.size === projects.length}
                  onChange={(e) => {
                    if (onSelect) projects.forEach((p) => onSelect(p.id, e.target.checked));
                  }}
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
          {projects.map((project) => (
            <tr
              key={project.id}
              className={cn(
                "transition-colors hover:bg-surface-hover/50",
                selected.has(project.id) && "bg-accent/5"
              )}
            >
              {onSelect && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(project.id)}
                    onChange={(e) => onSelect(project.id, e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  {col.render ? col.render(project) : (
                    <span className="text-sm text-foreground-secondary">{(project as any)[col.key]}</span>
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
