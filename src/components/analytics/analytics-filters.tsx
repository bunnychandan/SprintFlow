"use client";

import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface AnalyticsFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  projectId?: string;
  onProjectIdChange?: (value: string) => void;
  projects?: Array<{ id: string; name: string; code: string }>;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function AnalyticsFilters({
  search, onSearchChange, dateFrom, dateTo,
  onDateFromChange, onDateToChange,
  projectId, onProjectIdChange, projects,
  onClearFilters, hasActiveFilters,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search..."
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {onDateFromChange && onDateToChange && (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-foreground-muted" />
            <Input type="date" value={dateFrom || ""} onChange={(e) => onDateFromChange(e.target.value)} className="w-36" />
            <span className="text-xs text-foreground-muted">to</span>
            <Input type="date" value={dateTo || ""} onChange={(e) => onDateToChange(e.target.value)} className="w-36" />
          </div>
        )}

        {projects && onProjectIdChange && (
          <Select
            value={projectId || ""}
            onChange={(e) => onProjectIdChange(e.target.value)}
            options={[{ value: "", label: "All Projects" }, ...projects.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }))]}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear Filters</Button>
        )}
      </div>
    </div>
  );
}
