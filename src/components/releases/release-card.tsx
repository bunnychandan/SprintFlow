"use client";

import Link from "next/link";
import { Calendar, Package, ArrowRight, ListTodo } from "lucide-react";
import { cn } from "@/lib/cn";
import { ReleaseStatusBadge } from "./release-status-badge";
import type { ReleaseListItem } from "@/types/agile";

interface ReleaseCardProps {
  release: ReleaseListItem;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
}

export function ReleaseCard({ release, onSelect, selected }: ReleaseCardProps) {
  const taskCount = release._count?.tasks ?? 0;

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
          onChange={(e) => onSelect(release.id, e.target.checked)}
          className="absolute left-3 top-3 h-4 w-4 rounded border-border"
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <Link
              href={`/releases/${release.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
            >
              {release.name}
            </Link>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {release.project.name}
              {release.version && <span> &middot; v{release.version}</span>}
            </p>
          </div>
        </div>
      </div>

      {release.description && (
        <p className="mt-3 text-sm text-foreground-secondary line-clamp-2">{release.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <ReleaseStatusBadge status={release.status} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-foreground-secondary">
        {release.targetDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(release.targetDate).toLocaleDateString()}
          </span>
        )}
        <span className="flex items-center gap-1">
          <ListTodo className="h-3.5 w-3.5" />
          {taskCount} task{taskCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          {release.createdBy && (
            <span>by {release.createdBy.name || release.createdBy.email}</span>
          )}
        </div>

        <Link
          href={`/releases/${release.id}`}
          className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
