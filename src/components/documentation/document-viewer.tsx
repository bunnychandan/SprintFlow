"use client";

import { cn } from "@/lib/cn";
import { FileText } from "lucide-react";

interface DocumentViewerProps {
  title: string;
  content: string | null;
  excerpt?: string | null;
  className?: string;
}

export function DocumentViewer({ title, content, excerpt, className }: DocumentViewerProps) {
  if (!content && !excerpt) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-foreground-muted", className)}>
        <FileText className="h-12 w-12 mb-3" />
        <p className="text-sm">No content yet</p>
      </div>
    );
  }

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      {excerpt && <blockquote className="text-foreground-secondary italic border-l-4 border-accent pl-4 mb-6">{excerpt}</blockquote>}
      {content ? (
        <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{content}</div>
      ) : (
        <p className="text-foreground-muted italic">No content</p>
      )}
    </div>
  );
}
