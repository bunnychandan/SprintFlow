"use client";

import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface TaskEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreateTask?: () => void;
}

export function TaskEmptyState({ hasFilters, onClearFilters, onCreateTask }: TaskEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-12 w-12" />}
        title="No Matching Tasks"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<ClipboardList className="h-12 w-12" />}
      title="No Tasks Yet"
      description="Create your first task to get started."
      action={onCreateTask ? { label: "Create Task", onClick: onCreateTask } : undefined}
    />
  );
}
