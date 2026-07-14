"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface DeploymentFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  environment?: string;
  onEnvironmentChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters: boolean;
}

export function DeploymentFilters({
  search, onSearchChange, environment, onEnvironmentChange,
  status, onStatusChange, onClearFilters, hasActiveFilters,
}: DeploymentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input placeholder="Search deployments..." value={search || ""} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
            {search && <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"><X className="h-4 w-4" /></button>}
          </div>
        )}
        {onEnvironmentChange && (
          <Select value={environment || ""} onChange={(e) => onEnvironmentChange(e.target.value)} options={[
            { value: "", label: "All Environments" },
            { value: "DEVELOPMENT", label: "Development" },
            { value: "TESTING", label: "Testing" },
            { value: "STAGING", label: "Staging" },
            { value: "PRODUCTION", label: "Production" },
          ]} />
        )}
        {onStatusChange && (
          <Select value={status || ""} onChange={(e) => onStatusChange(e.target.value)} options={[
            { value: "", label: "All Statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "RUNNING", label: "Running" },
            { value: "SUCCESS", label: "Success" },
            { value: "FAILED", label: "Failed" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "ROLLED_BACK", label: "Rolled Back" },
          ]} />
        )}
      </div>
      {hasActiveFilters && <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear Filters</Button>}
    </div>
  );
}
