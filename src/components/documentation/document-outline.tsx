"use client";

import { cn } from "@/lib/cn";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { DocumentItem } from "@/types/documentation";

interface DocumentOutlineProps {
  items: DocumentItem[];
  activeId?: string;
  className?: string;
}

export function DocumentOutline({ items, activeId, className }: DocumentOutlineProps) {
  if (!items || items.length === 0) {
    return <div className={cn("text-xs text-foreground-muted p-4", className)}>No documents</div>;
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/documents/${item.id}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all",
            activeId === item.id ? "bg-accent-light text-accent font-medium" : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
          )}
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.title}</span>
          {item.childCount > 0 && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
        </Link>
      ))}
    </div>
  );
}
