"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Paperclip, Clock, AlertTriangle, GripVertical } from "lucide-react";
import { cn } from "@/lib/cn";
import { TaskPriorityBadge, TaskTypeBadge } from "@/components/task/task-status-badge";
import { Avatar } from "@/components/ui/avatar";
import type { BoardCardData } from "./board-types";

interface BoardCardProps {
  card: BoardCardData;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, cardId: string) => void;
  density?: "compact" | "normal" | "comfortable";
}

export function BoardCard({ card, isDragging, onDragStart, density = "normal" }: BoardCardProps) {
  const checklistPct = card.checklistTotal > 0 ? Math.round((card.checklistDone / card.checklistTotal) * 100) : 0;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== "DONE" && card.status !== "CANCELLED";

  const densityClasses = {
    compact: "p-2.5 gap-1",
    normal: "p-3 gap-1.5",
    comfortable: "p-4 gap-2",
  };

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(e, card.id);
  }, [card.id, onDragStart]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "group relative rounded-xl border bg-surface transition-all duration-200 cursor-grab active:cursor-grabbing select-none",
        isDragging ? "opacity-50 shadow-lg border-accent" : "border-border hover:border-accent/40 hover:shadow-md",
        densityClasses[density]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="h-3.5 w-3.5 text-foreground-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <TaskTypeBadge type={card.type} />
        </div>
        <TaskPriorityBadge priority={card.priority} />
      </div>

      <Link href={`/tasks/${card.id}`} className="block mt-1 group/title" onClick={(e) => e.stopPropagation()}>
        <h4 className={cn(
          "font-medium text-foreground hover:text-accent transition-colors line-clamp-2",
          density === "compact" ? "text-xs" : "text-sm"
        )}>
          {card.title}
        </h4>
      </Link>

      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        {card.storyPoints != null && (
          <span className="text-[10px] font-medium text-foreground-muted px-1.5 py-0.5 rounded-md bg-surface-hover">
            {card.storyPoints} SP
          </span>
        )}
        {card.labels && card.labels.length > 0 && card.labels.slice(0, 2).map((label, i) => (
          <span key={i} className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent truncate max-w-[80px]">
            {label}
          </span>
        ))}
        {isOverdue && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-red-500">
            <AlertTriangle className="h-3 w-3" />
          </span>
        )}
      </div>

      {card.dueDate && (
        <div className={cn("flex items-center gap-1 text-foreground-muted", isOverdue ? "text-red-500" : "")}>
          <Clock className="h-3 w-3" />
          <span className={density === "compact" ? "text-[9px]" : "text-[10px]"}>{new Date(card.dueDate).toLocaleDateString()}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-[10px] text-foreground-muted">
          {card.commentCount > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {card.commentCount}
            </span>
          )}
          {card.attachmentCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" />
              {card.attachmentCount}
            </span>
          )}
          {card.checklistTotal > 0 && (
            <span className="flex items-center gap-0.5" title={`${card.checklistDone}/${card.checklistTotal}`}>
              <span className={cn(
                "h-1.5 w-8 rounded-full bg-surface-hover overflow-hidden",
                checklistPct === 100 && "text-green-500"
              )}>
                <span className="block h-full rounded-full bg-accent transition-all" style={{ width: `${checklistPct}%` }} />
              </span>
            </span>
          )}
        </div>
        {card.assignee && (
          <Avatar src={card.assignee.image} name={card.assignee.name ?? undefined} className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
