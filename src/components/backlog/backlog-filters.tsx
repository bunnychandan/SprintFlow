"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface BacklogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  epicIdFilter?: string;
  onEpicIdFilterChange?: (value: string) => void;
  total: number;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
  epics?: Array<{ id: string; title: string }>;
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
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "LOWEST", label: "Lowest" },
];

export function BacklogFilters({
  search, onSearchChange, statusFilter, onStatusFilterChange,
  priorityFilter, onPriorityFilterChange,
  epicIdFilter, onEpicIdFilterChange,
  total, onClearFilters, hasActiveFilters, epics,
}: BacklogFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search backlog..."
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

          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            options={STATUS_OPTIONS}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            options={PRIORITY_OPTIONS}
          />

          {epics && onEpicIdFilterChange && (
            <Select
              value={epicIdFilter || ""}
              onChange={(e) => onEpicIdFilterChange(e.target.value)}
              options={[{ value: "", label: "All Epics" }, ...epics.map((e) => ({ value: e.id, label: e.title }))]}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground-secondary">
        <span>{total} task{total !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
