"use client";

import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface KnowledgeEmptyStateProps {
  title?: string;
  description?: string;
}

export function KnowledgeEmptyState({ title, description }: KnowledgeEmptyStateProps) {
  return (
    <EmptyState icon={<BookOpen className="h-12 w-12" />} title={title || "No Knowledge Base"} description={description || "Create a knowledge base to organize your documentation."} />
  );
}
