"use client";

import { use, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useBoard, useBoardStatistics } from "@/hooks/use-board";
import { useBoardPreferences } from "@/hooks/use-board-preferences";
import { Board } from "@/components/board/board";
import { BoardHeader } from "@/components/board/board-header";
import { BoardFilters } from "@/components/board/board-filters";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui";
import { useToast } from "@/contexts/toast-context";
import type { BoardFilters as BoardFiltersType } from "@/types/board";

export default function ProjectBoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { addToast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string | null; email: string }>>([]);

  const [filters, setFilters] = useState<BoardFiltersType>({});
  const [sprintId, setSprintId] = useState<string | undefined>(undefined);

  const { board, loading, error, refetch, move } = useBoard(projectId, sprintId, filters);
  const { stats, loading: statsLoading, refetch: refetchStats } = useBoardStatistics(projectId, sprintId);
  const {
    preferences,
    loaded: prefsLoaded,
    toggleColumnCollapse,
    setColumnWidth,
    setSwimlane,
    setDensity,
  } = useBoardPreferences(projectId);

  const hasActiveFilters = !!(filters.search || filters.priority || filters.assigneeId || filters.taskType || filters.labels || filters.reporterId || filters.onlyMyIssues);

  const handleMove = useCallback(async (taskId: string, targetStatus: string) => {
    try {
      await move({ taskId, targetStatus });
      addToast({ message: "Task moved", type: "success" });
    } catch {
      addToast({ message: "Failed to move task", type: "error" });
    }
  }, [move, addToast]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  if (loading || !prefsLoaded) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!board) return <ErrorState message="Failed to load board" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <BoardHeader
        boardType={board.boardType}
        projectName={board.columns.length > 0 ? undefined : projectName}
        sprintName={board.activeSprint?.name}
        swimlane={preferences.swimlane}
        onSwimlaneChange={setSwimlane}
        density={preferences.density}
        onDensityChange={setDensity}
        daysRemaining={stats?.daysRemaining}
        completionPct={stats?.completionPct}
      />

      <BoardFilters
        filters={filters}
        onFilterChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        members={projectMembers}
      />

      <Board
        data={board}
        stats={stats}
        onMove={handleMove}
        onRefetch={refetch}
        collapsedColumns={preferences.collapsedColumns}
        onToggleCollapse={toggleColumnCollapse}
        density={preferences.density}
        filters={filters}
        onFilterChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
