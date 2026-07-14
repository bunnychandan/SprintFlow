"use client";

import { Settings2, Layout, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { BoardType, BoardSwimlane, BoardDensity } from "@/types/board";

interface BoardHeaderProps {
  boardType: BoardType;
  projectName?: string;
  sprintName?: string;
  onToggleBoardType?: () => void;
  swimlane: BoardSwimlane;
  onSwimlaneChange: (swimlane: BoardSwimlane) => void;
  density: BoardDensity;
  onDensityChange: (density: BoardDensity) => void;
  daysRemaining?: number | null;
  completionPct?: number;
}

const SWIMLANE_OPTIONS = [
  { value: "none", label: "No Swimlanes" },
  { value: "assignee", label: "Assignee" },
  { value: "priority", label: "Priority" },
  { value: "epic", label: "Epic" },
  { value: "labels", label: "Labels" },
  { value: "reporter", label: "Reporter" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "comfortable", label: "Comfortable" },
];

export function BoardHeader({
  boardType,
  projectName,
  sprintName,
  onToggleBoardType,
  swimlane,
  onSwimlaneChange,
  density,
  onDensityChange,
  daysRemaining,
  completionPct,
}: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">{projectName || "Board"}</h1>
          {sprintName && (
            <p className="text-sm text-foreground-secondary">{sprintName}</p>
          )}
        </div>
        {daysRemaining != null && (
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <span>{daysRemaining}d remaining</span>
            {completionPct != null && (
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 rounded-full bg-surface-hover overflow-hidden">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${completionPct}%` }} />
                </div>
                <span>{completionPct}%</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onToggleBoardType && (
          <Button variant="secondary" size="sm" onClick={onToggleBoardType}>
            <Layout className="h-4 w-4 mr-1" />
            {boardType === "SCRUM" ? "Kanban" : "Scrum"}
          </Button>
        )}

        <Select
          value={swimlane}
          onChange={(e) => onSwimlaneChange(e.target.value as BoardSwimlane)}
          options={SWIMLANE_OPTIONS}
        />

        <Select
          value={density}
          onChange={(e) => onDensityChange(e.target.value as BoardDensity)}
          options={DENSITY_OPTIONS}
        />
      </div>
    </div>
  );
}
