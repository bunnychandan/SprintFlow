"use client";

import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface ResourceEmptyStateProps {
  title?: string;
  description?: string;
}

export function ResourceEmptyState({ title, description }: ResourceEmptyStateProps) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title={title || "No Resources Found"}
      description={description || "No resources match your current filters. Try adjusting your search criteria."}
    />
  );
}
