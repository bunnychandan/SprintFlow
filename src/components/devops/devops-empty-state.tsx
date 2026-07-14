"use client";

import { Rocket } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface DevOpsEmptyStateProps {
  title?: string;
  description?: string;
}

export function DevOpsEmptyState({ title, description }: DevOpsEmptyStateProps) {
  return (
    <EmptyState
      icon={<Rocket className="h-12 w-12" />}
      title={title || "No DevOps Data"}
      description={description || "No deployments or pipelines have been created yet."}
    />
  );
}
