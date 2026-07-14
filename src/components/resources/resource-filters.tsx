"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface ResourceFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  department?: string;
  onDepartmentChange?: (value: string) => void;
  role?: string;
  onRoleChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function ResourceFilters({
  search, onSearchChange, department, onDepartmentChange,
  role, onRoleChange, onClearFilters, hasActiveFilters,
}: ResourceFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              placeholder="Search resources..."
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
        {onDepartmentChange && (
          <Select
            value={department || ""}
            onChange={(e) => onDepartmentChange(e.target.value)}
            options={[
              { value: "", label: "All Departments" },
              { value: "Engineering", label: "Engineering" },
              { value: "Design", label: "Design" },
              { value: "Product", label: "Product" },
              { value: "QA", label: "QA" },
              { value: "DevOps", label: "DevOps" },
            ]}
          />
        )}
        {onRoleChange && (
          <Select
            value={role || ""}
            onChange={(e) => onRoleChange(e.target.value)}
            options={[
              { value: "", label: "All Roles" },
              { value: "SUPER_ADMIN", label: "Super Admin" },
              { value: "ADMIN", label: "Admin" },
              { value: "USER", label: "User" },
            ]}
          />
        )}
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear Filters</Button>
      )}
    </div>
  );
}
