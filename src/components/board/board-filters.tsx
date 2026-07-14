"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { BoardFilters as BoardFiltersType } from "@/types/board";

interface BoardFiltersProps {
  filters: BoardFiltersType;
  onFilterChange: (filters: BoardFiltersType) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  members?: Array<{ id: string; name: string | null; email: string }>;
}

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "LOWEST", label: "Lowest" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "HIGHEST", label: "Highest" },
  { value: "CRITICAL", label: "Critical" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "EPIC", label: "Epic" },
  { value: "STORY", label: "Story" },
  { value: "TASK", label: "Task" },
  { value: "SUBTASK", label: "Subtask" },
  { value: "BUG", label: "Bug" },
  { value: "SPIKE", label: "Spike" },
  { value: "IMPROVEMENT", label: "Improvement" },
  { value: "TECH_DEBT", label: "Tech Debt" },
  { value: "RESEARCH", label: "Research" },
];

export function BoardFilters({
  filters,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  members,
}: BoardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <Input
          placeholder="Search tasks..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-9 text-sm"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Select
        value={filters.priority || ""}
        onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
        options={PRIORITY_OPTIONS}
      />

      <Select
        value={filters.taskType || ""}
        onChange={(e) => onFilterChange({ ...filters, taskType: e.target.value })}
        options={TYPE_OPTIONS}
      />

      {members && (
        <Select
          value={filters.assigneeId || ""}
          onChange={(e) => onFilterChange({ ...filters, assigneeId: e.target.value })}
          options={[
            { value: "", label: "All Assignees" },
            ...members.map((m) => ({ value: m.id, label: m.name || m.email })),
          ]}
        />
      )}

      <label className="flex items-center gap-1.5 text-xs text-foreground-secondary cursor-pointer whitespace-nowrap">
        <input
          type="checkbox"
          checked={filters.onlyMyIssues || false}
          onChange={(e) => onFilterChange({ ...filters, onlyMyIssues: e.target.checked || undefined })}
          className="h-3.5 w-3.5 rounded border-border"
        />
        My Issues
      </label>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}
