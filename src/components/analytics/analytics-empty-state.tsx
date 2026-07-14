"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface AnalyticsEmptyStateProps {
  title?: string;
  description?: string;
}

export function AnalyticsEmptyState({ title, description }: AnalyticsEmptyStateProps) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-12 w-12" />}
      title={title || "No Analytics Data"}
      description={description || "Analytics data will appear here once there is sufficient project activity."}
    />
  );
}
