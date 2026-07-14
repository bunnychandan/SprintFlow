"use client";

import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface BacklogEmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  projectId?: string;
}

export function BacklogEmptyState({ hasFilters, onClearFilters }: BacklogEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<ListTodo className="h-12 w-12" />}
        title="No Matching Tasks"
        description="Try adjusting your search or filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<ListTodo className="h-12 w-12" />}
      title="Backlog is Empty"
      description="Add tasks to the backlog to start planning your work."
    />
  );
}
