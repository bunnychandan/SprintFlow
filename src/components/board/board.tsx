"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { BoardColumn } from "./board-column";
import { BoardSwimlane } from "./board-swimlane";
import { BoardEmptyState } from "./board-empty-state";
import { BoardStatistics } from "./board-statistics";
import { BacklogPanel } from "./backlog-panel";
import { SprintProgressWidget } from "./sprint-progress-widget";

import type { BoardData, BoardFilters, BoardStatistics as BoardStatsType } from "@/types/board";

interface BoardProps {
  data: BoardData;
  stats?: BoardStatsType | null;
  onMove: (taskId: string, targetStatus: string) => void;
  onRefetch: () => void;
  collapsedColumns: string[];
  onToggleCollapse: (status: string) => void;
  density: "compact" | "normal" | "comfortable";
  filters: BoardFilters;
  onFilterChange: (filters: BoardFilters) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function Board({
  data,
  stats,
  onMove,
  onRefetch,
  collapsedColumns,
  onToggleCollapse,
  density,
  filters,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
}: BoardProps) {
  const [showStats, setShowStats] = useState(false);
  const [showBacklog, setShowBacklog] = useState(false);

  const handleDrop = useCallback((targetStatus: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) onMove(taskId, targetStatus);
  }, [onMove]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleCardDragStart = useCallback((_e: React.DragEvent, _cardId: string) => {
    // Optional: track drag state
  }, []);

  const hasSwimlane = data.preferences.swimlane !== "none";

  const groupedColumns = useMemo(() => {
    if (!hasSwimlane) return null;

    const groups = new Map<string, typeof data.columns>();
    const swimlaneKey = data.preferences.swimlane;

    for (const col of data.columns) {
      for (const task of col.tasks) {
        let key = "";
        switch (swimlaneKey) {
          case "assignee":
            key = task.assignee?.name || "Unassigned";
            break;
          case "priority":
            key = task.priority;
            break;
          case "reporter":
            key = task.reporter?.name || "Unknown";
            break;
          case "labels":
            key = task.labels?.[0] || "No Labels";
            break;
          default:
            key = "All";
        }
        if (!groups.has(key)) groups.set(key, data.columns.map((c) => ({ ...c, tasks: [] })));
        const group = groups.get(key)!;
        const groupCol = group.find((c) => c.status === col.status);
        if (groupCol) groupCol.tasks.push(task);
      }
    }
    return groups;
  }, [data.columns, hasSwimlane, data.preferences.swimlane]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStats(!showStats)}
          className={cn("text-xs px-3 py-1.5 rounded-lg border border-border transition-colors", showStats ? "bg-accent text-white border-accent" : "text-foreground-secondary hover:text-foreground")}
        >
          Statistics
        </button>
        {data.boardType === "SCRUM" && (
          <button
            onClick={() => setShowBacklog(!showBacklog)}
            className={cn("text-xs px-3 py-1.5 rounded-lg border border-border transition-colors", showBacklog ? "bg-accent text-white border-accent" : "text-foreground-secondary hover:text-foreground")}
          >
            Backlog
          </button>
        )}
      </div>

      {showStats && stats && <BoardStatistics stats={stats} />}

      {showBacklog && data.boardType === "SCRUM" && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <BacklogPanel
            tasks={[]}
            sprints={[]}
            onMoveToSprint={() => {}}
          />
        </div>
      )}

      {data.activeSprint && stats && (
        <SprintProgressWidget
          name={data.activeSprint.name}
          totalPoints={stats.totalPoints}
          completedPoints={stats.completedPoints}
          completionPct={stats.completionPct}
          daysRemaining={stats.daysRemaining}
          velocity={stats.velocity}
        />
      )}

      {hasSwimlane && groupedColumns ? (
        <div className="space-y-2">
          {Array.from(groupedColumns.entries()).map(([groupName, groupCols]) => (
            <BoardSwimlane
              key={groupName}
              name={groupName}
              columns={groupCols}
              density={density}
              collapsedColumns={collapsedColumns}
              onToggleCollapse={onToggleCollapse}
              onColumnDrop={handleDrop}
              onColumnDragOver={handleDragOver}
              onCardDragStart={handleCardDragStart}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {data.columns.map((col) => (
            <BoardColumn
              key={col.status}
              column={col}
              density={density}
              collapsed={collapsedColumns.includes(col.status)}
              onToggleCollapse={() => onToggleCollapse(col.status)}
              onDrop={handleDrop(col.status)}
              onDragOver={handleDragOver}
              onCardDragStart={handleCardDragStart}
            />
          ))}
        </div>
      )}

      {data.columns.every((col) => col.tasks.length === 0) && (
        <BoardEmptyState
          boardType={data.boardType}
          hasFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
        />
      )}
    </div>
  );
}
