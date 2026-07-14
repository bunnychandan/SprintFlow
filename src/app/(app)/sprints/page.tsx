"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { SprintCard } from "@/components/sprint/sprint-card";
import { SprintTable } from "@/components/sprint/sprint-table";
import { SprintFilters } from "@/components/sprint/sprint-filters";
import { SprintEmptyState } from "@/components/sprint/sprint-empty-state";
import { useSprints } from "@/hooks/use-sprints";
import type { SprintViewMode } from "@/types/sprint";

export default function SprintsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState<SprintViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useSprints({
    search: search || undefined,
    status: statusFilter || undefined,
    sortBy,
  });

  const hasActiveFilters = !!(search || statusFilter);

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
  }, []);

  const sprints = data?.sprints || [];
  const total = data?.total || 0;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Sprint Directory"
        subtitle="Manage sprints across all projects — track velocity, burndown, and team delivery."
        metadata={`${total} sprint${total !== 1 ? "s" : ""}`}
        actions={
          isAdmin && (
            <Button
              variant="gradient"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {}}
            >
              Create Sprint
            </Button>
          )
        }
      />

      <div className="mt-6 space-y-4">
        <SprintFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
          <ErrorState title="Failed to load sprints" message={error} onRetry={refetch} />
        ) : sprints.length === 0 ? (
          <SprintEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sprints.map((sprint) => (
              <SprintCard
                key={sprint.id}
                sprint={sprint}
                onSelect={handleSelect}
                selected={selected.has(sprint.id)}
              />
            ))}
          </div>
        ) : (
          <SprintTable
            sprints={sprints}
            onSelect={handleSelect}
            selected={selected}
          />
        )}
      </div>
    </main>
  );
}
