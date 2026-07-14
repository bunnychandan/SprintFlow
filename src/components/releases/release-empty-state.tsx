"use client";

import { Package } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ReleaseEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function ReleaseEmptyState({ hasFilters, onClearFilters }: ReleaseEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No Matching Releases"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<Package className="h-12 w-12" />}
      title="No Releases Yet"
      description="Releases represent deployable versions. Create your first release to plan delivery milestones."
    />
  );
}
