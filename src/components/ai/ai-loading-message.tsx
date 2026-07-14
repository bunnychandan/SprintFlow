"use client";

import { cn } from "@/lib/cn";

interface AILoadingMessageProps {
  className?: string;
}

export function AILoadingMessage({ className }: AILoadingMessageProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-foreground-muted", className)}>
      <div className="animate-pulse flex gap-1">
        <div className="h-2 w-2 rounded-full bg-accent animate-bounce" />
        <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.1s" }} />
        <div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.2s" }} />
      </div>
      <span>Thinking...</span>
    </div>
  );
}
