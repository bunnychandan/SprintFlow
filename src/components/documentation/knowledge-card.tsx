"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { BookOpen, FileText } from "lucide-react";
import type { KnowledgeBaseItem } from "@/types/documentation";

interface KnowledgeCardProps {
  knowledgeBase: KnowledgeBaseItem;
  className?: string;
}

export function KnowledgeCard({ knowledgeBase, className }: KnowledgeCardProps) {
  return (
    <Card className={cn("p-5 hover:shadow-md transition-all", className)}>
      <Link href={`/knowledge/${knowledgeBase.id}`} className="block">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent-light/30">
            <BookOpen className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">{knowledgeBase.name}</h3>
            <p className="text-xs text-foreground-muted">{knowledgeBase.slug}</p>
          </div>
        </div>
        {knowledgeBase.description && (
          <p className="text-xs text-foreground-secondary line-clamp-2 mb-3">{knowledgeBase.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{knowledgeBase.documentCount} docs</span>
        </div>
      </Link>
    </Card>
  );
}
