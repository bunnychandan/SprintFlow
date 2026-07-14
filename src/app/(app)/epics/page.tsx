"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { EpicCard } from "@/components/epics/epic-card";
import { EpicTable } from "@/components/epics/epic-table";
import { EpicFilters } from "@/components/epics/epic-filters";
import { EpicEmptyState } from "@/components/epics/epic-empty-state";
import { useEpics } from "@/hooks/use-epics";
import type { EpicViewMode } from "@/types/agile";

export default function EpicsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState<EpicViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useEpics({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sortBy,
  });

  const hasActiveFilters = !!(search || statusFilter || priorityFilter);

  const handleSelect = useCallback((id: string, isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  }, []);

  const epics = data?.epics || [];
  const total = data?.pagination?.total || 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Epic Directory"
        subtitle="Manage epics across all projects — organize large bodies of work, track progress, and align teams."
        metadata={`${total} epic${total !== 1 ? "s" : ""}`}
        actions={
          isAdmin && (
            <Button
              variant="gradient"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {}}
            >
              Create Epic
            </Button>
          )
        }
      />

      <div className="mt-6 space-y-4">
        <EpicFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          total={total}
          selectedCount={selected.size}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-surface-hover" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-surface-hover" />
                      <div className="h-3 w-16 rounded bg-surface-hover" />
                    </div>
                  </div>
                  <div className="mt-4 h-8 w-full rounded bg-surface-hover" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-surface-hover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 rounded-xl border border-border bg-surface" />
              ))}
            </div>
          )
        ) : error ? (
          <ErrorState title="Failed to load epics" message={error} onRetry={refetch} />
        ) : epics.length === 0 ? (
          <EpicEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {epics.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                onSelect={handleSelect}
                selected={selected.has(epic.id)}
              />
            ))}
          </div>
        ) : (
          <EpicTable
            epics={epics}
            onSelect={handleSelect}
            selected={selected}
          />
        )}
      </div>
    </main>
  );
}
