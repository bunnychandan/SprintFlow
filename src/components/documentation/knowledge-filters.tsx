"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KnowledgeFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function KnowledgeFilters({ search, onSearchChange, onClearFilters, hasActiveFilters }: KnowledgeFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input placeholder="Search knowledge bases..." value={search || ""} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
            {search && <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        )}
      </div>
      {hasActiveFilters && <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear Filters</Button>}
    </div>
  );
}
