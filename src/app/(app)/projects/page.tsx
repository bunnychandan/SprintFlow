"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button, PageHeader, ErrorState } from "@/components/ui";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectTable } from "@/components/project/project-table";
import { ProjectFilters } from "@/components/project/project-filters";
import { ProjectEmptyState } from "@/components/project/project-empty-state";
import { useProjects, useProjectActions } from "@/hooks/use-projects";
import CreateProjectModal from "@/components/create-project-modal";
import type { ProjectViewMode } from "@/types/project";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error, refetch } = useProjects({
    search: search || undefined,
    status: statusFilter || undefined,
    visibility: visibilityFilter || undefined,
    sortBy,
  });

  const { toggleFavorite, create } = useProjectActions();

  const hasActiveFilters = !!(search || statusFilter || visibilityFilter);

  const handleToggleFavorite = useCallback(async (id: string, favorited: boolean) => {
    await toggleFavorite(id, favorited);
    refetch();
  }, [toggleFavorite, refetch]);

  const handleSelect = useCallback((id: string, isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleCreateProject = useCallback(async (formData: { name: string; code: string; description?: string | null; visibility?: string }) => {
    await create(formData);
    setIsModalOpen(false);
    refetch();
  }, [create, refetch]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setVisibilityFilter("");
  }, []);

  const projects = data?.projects || [];
  const total = data?.total || 0;
  const selectedCount = selected.size;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 overflow-y-auto">
      <PageHeader
        title="Project Directory"
        subtitle="Select a project workspace to collaborate with your team, plan sprints, and track delivery."
        metadata={total > 0 ? `${total} project${total !== 1 ? "s" : ""}` : "Enterprise Portfolio"}
        actions={
          isAdmin && (
            <Button
              variant="gradient"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Project
            </Button>
          )
        }
      />

      <div className="mt-6 space-y-4">
        <ProjectFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          visibilityFilter={visibilityFilter}
          onVisibilityFilterChange={setVisibilityFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          total={total}
          selectedCount={selectedCount}
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
          <ErrorState title="Failed to load projects" message={error} onRetry={refetch} />
        ) : projects.length === 0 ? (
          <ProjectEmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onCreateProject={isAdmin ? () => setIsModalOpen(true) : undefined}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleFavorite={handleToggleFavorite}
                onSelect={handleSelect}
                selected={selected.has(project.id)}
              />
            ))}
          </div>
        ) : (
          <ProjectTable
            projects={projects}
            onToggleFavorite={handleToggleFavorite}
            onSelect={handleSelect}
            selected={selected}
          />
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); refetch(); }}
      />
    </main>
  );
}
