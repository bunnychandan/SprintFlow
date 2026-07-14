"use client";

import { useState } from "react";
import { MoreHorizontal, User, ArrowUpDown, Tag, Archive, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface TaskQuickActionsProps {
  taskId: string;
  projectId: string;
  onAssign?: (taskId: string, assigneeId: string) => void;
  onArchive?: (taskId: string) => void;
  members?: Array<{ id: string; name: string | null; email: string }>;
}

export function TaskQuickActions({ taskId, projectId, onAssign, onArchive, members }: TaskQuickActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="rounded-lg p-1 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-surface shadow-xl py-1">
            <button
              onClick={() => { router.push(`/tasks/${taskId}`); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-hover transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open Detail
            </button>

            {members && members.length > 0 && (
              <div className="border-t border-border mt-1 pt-1">
                <p className="px-3 py-1 text-[10px] font-medium text-foreground-muted uppercase">Assign</p>
                {members.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onAssign?.(taskId, m.id); setOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-foreground-muted" />
                    {m.name || m.email}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => { onArchive?.(taskId); setOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-hover transition-colors"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
