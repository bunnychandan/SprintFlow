"use client";

import { cn } from "@/lib/cn";
import { BoardColumn } from "./board-column";
import type { BoardColumnData } from "./board-types";

interface BoardSwimlaneProps {
  name: string;
  columns: BoardColumnData[];
  density?: "compact" | "normal" | "comfortable";
  collapsedColumns: string[];
  onToggleCollapse: (status: string) => void;
  onColumnDrop: (status: string) => (e: React.DragEvent) => void;
  onColumnDragOver: (e: React.DragEvent) => void;
  onCardDragStart: (e: React.DragEvent, cardId: string) => void;
}

export function BoardSwimlane({
  name,
  columns,
  density,
  collapsedColumns,
  onToggleCollapse,
  onColumnDrop,
  onColumnDragOver,
  onCardDragStart,
}: BoardSwimlaneProps) {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex items-center gap-2 px-1 py-2 mb-2">
        <div className="h-1 w-1 rounded-full bg-accent" />
        <span className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
          {name}
        </span>
        <span className="text-[10px] text-foreground-muted">
          {columns.reduce((sum, col) => sum + col.taskCount, 0)} tasks
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((col) => (
          <BoardColumn
            key={col.status}
            column={col}
            density={density}
            collapsed={collapsedColumns.includes(col.status)}
            onToggleCollapse={() => onToggleCollapse(col.status)}
            onDrop={onColumnDrop(col.status)}
            onDragOver={onColumnDragOver}
            onCardDragStart={onCardDragStart}
          />
        ))}
      </div>
    </div>
  );
}
