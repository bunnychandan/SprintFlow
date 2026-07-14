"use client";

import { Search, Grid3X3, List, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { TaskViewMode } from "@/types/task";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  viewMode: TaskViewMode;
  onViewModeChange: (mode: TaskViewMode) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  total: number;
  selectedCount: number;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "BACKLOG", label: "Backlog" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "QA_TESTING", label: "QA Testing" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REOPENED", label: "Reopened" },
];

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

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "updatedAt", label: "Recently Updated" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due Date" },
  { value: "storyPoints", label: "Story Points" },
];

export function TaskFilters({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  priorityFilter, onPriorityFilterChange,
  typeFilter, onTypeFilterChange,
  assigneeFilter, onAssigneeFilterChange,
  viewMode, onViewModeChange,
  sortBy, onSortByChange,
  total, selectedCount,
  onClearFilters, hasActiveFilters,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} options={STATUS_OPTIONS} />
            <Select value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value)} options={PRIORITY_OPTIONS} />
            <Select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)} options={TYPE_OPTIONS} />
            <Select value={sortBy} onChange={(e) => onSortByChange(e.target.value)} options={SORT_OPTIONS} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}

          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => onViewModeChange("table")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "table" ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("compact")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "compact" ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground-secondary">
        <span>{total} task{total !== 1 ? "s" : ""}</span>
        {selectedCount > 0 && (
          <span className="font-medium text-accent">{selectedCount} selected</span>
        )}
      </div>
    </div>
  );
}
