"use client";

import { Bot } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface AIEmptyStateProps {
  title?: string;
  description?: string;
}

export function AIEmptyState({ title, description }: AIEmptyStateProps) {
  return <EmptyState icon={<Bot className="h-12 w-12" />} title={title || "No AI Conversations"} description={description || "Start a new conversation with the AI assistant."} />;
}
