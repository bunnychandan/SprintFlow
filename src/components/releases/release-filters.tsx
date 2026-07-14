"use client";

import { Search, Grid3X3, List, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ReleaseViewMode } from "@/types/agile";

interface ReleaseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: ReleaseViewMode;
  onViewModeChange: (mode: ReleaseViewMode) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  total: number;
  selectedCount: number;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "RELEASED", label: "Released" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "targetDate", label: "Target Date" },
  { value: "version", label: "Version" },
];

export function ReleaseFilters({
  search, onSearchChange, statusFilter, onStatusFilterChange,
  viewMode, onViewModeChange, sortBy, onSortByChange,
  total, selectedCount, onClearFilters, hasActiveFilters,
}: ReleaseFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search releases..."
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
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}

          <div className="flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "grid" ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                viewMode === "table" ? "bg-surface-hover text-foreground" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-foreground-secondary">
        <span>{total} release{total !== 1 ? "s" : ""}</span>
        {selectedCount > 0 && (
          <span className="font-medium text-accent">{selectedCount} selected</span>
        )}
      </div>
    </div>
  );
}
