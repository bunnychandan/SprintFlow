"use client";

import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import type { AIPromptTemplateItem } from "@/types/ai";

interface AIPromptLibraryProps {
  prompts: AIPromptTemplateItem[];
  onSelect: (prompt: AIPromptTemplateItem) => void;
  onEdit?: (prompt: AIPromptTemplateItem) => void;
  loading?: boolean;
  className?: string;
}

export function AIPromptLibrary({ prompts, onSelect, onEdit, loading, className }: AIPromptLibraryProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", className)}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-surface-hover h-24" />)}
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return <div className={cn("text-center py-8 text-sm text-foreground-muted", className)}>No prompt templates found</div>;
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-3", className)}>
      {prompts.map((p) => (
        <Card key={p.id} className="p-4 cursor-pointer hover:shadow-md transition-all" onClick={() => onSelect(p)}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-foreground">{p.name}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-light/30 text-accent">{p.category}</span>
          </div>
          {p.description && <p className="text-xs text-foreground-secondary line-clamp-2 mb-2">{p.description}</p>}
          <p className="text-xs text-foreground-muted line-clamp-2 font-mono">{p.prompt}</p>
        </Card>
      ))}
    </div>
  );
}
