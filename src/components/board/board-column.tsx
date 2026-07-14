"use client";

import { useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { BoardCard } from "./board-card";
import type { BoardColumnData } from "./board-types";

interface BoardColumnProps {
  column: BoardColumnData;
  density?: "compact" | "normal" | "comfortable";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onCardDragStart?: (e: React.DragEvent, cardId: string) => void;
}

const COLORS: Record<string, string> = {
  BACKLOG: "bg-gray-500",
  TODO: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  IN_REVIEW: "bg-purple-500",
  QA_TESTING: "bg-orange-500",
  BLOCKED: "bg-red-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-gray-400",
  REOPENED: "bg-rose-500",
};

export function BoardColumn({
  column,
  density = "normal",
  collapsed = false,
  onToggleCollapse,
  onDrop,
  onDragOver,
  onCardDragStart,
}: BoardColumnProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
    onDragOver?.(e);
  }, [onDragOver]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onDrop?.(e);
  }, [onDrop]);

  const color = COLORS[column.status] || "bg-gray-500";

  return (
    <div
      ref={dropRef}
      className={cn(
        "flex flex-col rounded-xl border bg-surface transition-all duration-200 min-w-[280px] max-w-[340px] w-[300px] shrink-0",
        dragOver ? "border-accent ring-1 ring-accent/30 bg-accent/5" : "border-border",
        collapsed && "w-auto min-w-[60px]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b border-border cursor-pointer hover:bg-surface-hover transition-colors rounded-t-xl"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onToggleCollapse && (
            <button className="text-foreground-muted hover:text-foreground transition-colors">
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", color)} />
          <span className="text-sm font-semibold text-foreground truncate">{column.label}</span>
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-surface-hover px-1.5 text-[10px] font-medium text-foreground-muted">
            {column.taskCount}
          </span>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col gap-2 p-2 overflow-y-auto max-h-[calc(100vh-280px)]">
          {column.tasks.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              density={density}
              onDragStart={onCardDragStart}
            />
          ))}
          {column.tasks.length === 0 && (
            <div className="flex items-center justify-center py-8 text-xs text-foreground-muted">
              Drop tasks here
            </div>
          )}
        </div>
      )}
    </div>
  );
}
