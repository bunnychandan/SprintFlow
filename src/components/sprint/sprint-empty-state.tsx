"use client";

import { GitBranch } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface SprintEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateSprint?: () => void;
}

export function SprintEmptyState({ hasFilters, onClearFilters, onCreateSprint }: SprintEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<GitBranch className="h-12 w-12" />}
        title="No Matching Sprints"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<GitBranch className="h-12 w-12" />}
      title="No Sprints Yet"
      description="Create your first sprint to start tracking work."
      action={onCreateSprint ? { label: "Create Sprint", onClick: onCreateSprint } : undefined}
    />
  );
}
