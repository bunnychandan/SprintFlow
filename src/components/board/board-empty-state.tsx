"use client";

import { Columns } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface BoardEmptyStateProps {
  boardType: "SCRUM" | "KANBAN";
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function BoardEmptyState({ boardType, hasFilters, onClearFilters }: BoardEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={<Columns className="h-12 w-12" />}
        title="No Matching Tasks"
        description="Try adjusting your board filters to find what you're looking for."
        action={onClearFilters ? { label: "Clear Filters", onClick: onClearFilters } : undefined}
      />
    );
  }

  if (boardType === "SCRUM") {
    return (
      <EmptyState
        icon={<Columns className="h-12 w-12" />}
        title="Sprint Board is Empty"
        description="Add tasks to the active sprint to populate the board."
      />
    );
  }

  return (
    <EmptyState
      icon={<Columns className="h-12 w-12" />}
      title="Board is Empty"
      description="Create tasks to populate the Kanban board."
    />
  );
}
