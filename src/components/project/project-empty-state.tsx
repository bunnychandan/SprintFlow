"use client";

import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ProjectEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateProject?: () => void;
}

export function ProjectEmptyState({ hasFilters, onClearFilters, onCreateProject }: ProjectEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-12 w-12" />}
        title="No Matching Projects"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title="No Projects Yet"
      description="Create your first project to get started with tracking."
      action={onCreateProject ? { label: "Create Project", onClick: onCreateProject } : undefined}
    />
  );
}
