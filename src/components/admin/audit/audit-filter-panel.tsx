"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui";

interface AuditFilterPanelProps {
  filters: {
    action: string;
    entityType: string;
    actorId: string;
    success: string;
    projectId: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: AuditFilterPanelProps["filters"]) => void;
  onClear: () => void;
  actions?: string[];
  entityTypes?: string[];
}

export function AuditFilterPanel({ filters, onFilterChange, onClear, actions, entityTypes }: AuditFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const hasFilters = Object.values(filters).some((v) => v !== "");

  const set = (key: keyof typeof filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground flex items-center gap-1">
        <Filter className="h-3.5 w-3.5" /> Filters {hasFilters ? "(active)" : ""}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-border bg-popover p-4 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Action</label>
              <select value={filters.action} onChange={(e) => set("action", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 px-2 text-xs text-foreground focus:border-accent focus:outline-none">
                <option value="">All Actions</option>
                {actions?.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Entity Type</label>
              <select value={filters.entityType} onChange={(e) => set("entityType", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 px-2 text-xs text-foreground focus:border-accent focus:outline-none">
                <option value="">All Entities</option>
                {entityTypes?.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Status</label>
              <select value={filters.success} onChange={(e) => set("success", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 px-2 text-xs text-foreground focus:border-accent focus:outline-none">
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Date From</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 px-2 text-xs text-foreground focus:border-accent focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Date To</label>
              <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface py-1.5 px-2 text-xs text-foreground focus:border-accent focus:outline-none" />
            </div>
          </div>
          {hasFilters && (
            <div className="flex justify-end mt-3">
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-3.5 w-3.5 mr-1" /> Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
