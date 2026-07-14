"use client";

import Link from "next/link";
import { LayoutDashboard, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/cn";
import { EpicStatusBadge } from "./epic-status-badge";
import type { EpicListItem } from "@/types/agile";

interface EpicCardProps {
  epic: EpicListItem;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
}

export function EpicCard({ epic, onSelect, selected }: EpicCardProps) {
  const taskCount = epic._count?.tasks ?? 0;

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
          onChange={(e) => onSelect(epic.id, e.target.checked)}
          className="absolute left-3 top-3 h-4 w-4 rounded border-border"
        />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${epic.color}20`, color: epic.color }}
          >
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <Link
              href={`/epics/${epic.id}`}
              className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
            >
              {epic.title}
            </Link>
            <p className="text-xs text-foreground-secondary mt-0.5">{epic.project.name}</p>
          </div>
        </div>
      </div>

      {epic.description && (
        <p className="mt-3 text-sm text-foreground-secondary line-clamp-2">{epic.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <EpicStatusBadge status={epic.status} />
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-foreground-secondary">
        {epic.targetDate && (
          <span className="flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {new Date(epic.targetDate).toLocaleDateString()}
          </span>
        )}
        <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2 text-xs text-foreground-secondary">
          {epic.owner && (
            <span>by {epic.owner.name || epic.owner.email}</span>
          )}
        </div>

        <Link
          href={`/epics/${epic.id}`}
          className="flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
