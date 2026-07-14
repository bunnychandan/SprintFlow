"use client";

import { useState, useCallback } from "react";
import { Users } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceTable } from "@/components/resources/resource-table";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { ResourceSummaryCards } from "@/components/resources/resource-summary-cards";
import { CapacityChart } from "@/components/resources/capacity-chart";
import { UtilizationChart } from "@/components/resources/utilization-chart";
import { ResourceEmptyState } from "@/components/resources/resource-empty-state";
import { useResources, useCapacity, useAvailability } from "@/hooks/use-resources";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filters = { search: search || undefined, department: department || undefined, role: role || undefined, isActive: true };
  const { data: resources, loading, error, refetch } = useResources(filters);
  const { data: capacity } = useCapacity();
  const { data: availability } = useAvailability();

  const hasActiveFilters = !!(search || department || role);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setDepartment("");
    setRole("");
  }, []);

  if (error) {
    return <ErrorState title="Failed to load resources" message={error} onRetry={refetch} />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Resource Directory"
        subtitle="View and manage team resources, capacity, and allocations."
        metadata={`${resources.length} resources`}
      />

      <div className="mt-6 space-y-6">
        <ResourceSummaryCards resources={resources} capacity={capacity} availability={availability} loading={loading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CapacityChart data={capacity} loading={loading} />
          <UtilizationChart data={capacity} loading={loading} />
        </div>

        <ResourceFilters
          search={search}
          onSearchChange={setSearch}
          department={department}
          onDepartmentChange={setDepartment}
          role={role}
          onRoleChange={setRole}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {loading ? (
          viewMode === "grid" ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-hover" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-surface-hover" />
                      <div className="h-3 w-16 rounded bg-surface-hover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ResourceTable resources={[]} loading />
          )
        ) : resources.length === 0 ? (
          <ResourceEmptyState
            title="No Resources Found"
            description={hasActiveFilters ? "No resources match your filters. Try adjusting your search." : "No resources have been added yet."}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <ResourceTable resources={resources} />
        )}
      </div>
    </main>
  );
}
