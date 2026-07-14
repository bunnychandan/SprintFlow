"use client";

import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface EpicEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EpicEmptyState({ hasFilters, onClearFilters }: EpicEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<LayoutDashboard className="h-12 w-12" />}
        title="No Matching Epics"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<LayoutDashboard className="h-12 w-12" />}
      title="No Epics Yet"
      description="Epics represent large bodies of work. Create your first epic to organize features and initiatives."
    />
  );
}
