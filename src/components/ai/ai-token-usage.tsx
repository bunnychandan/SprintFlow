"use client";

import { cn } from "@/lib/cn";

interface AITokenUsageProps {
  tokens: number;
  cost: number;
  model?: string;
  responseTime?: number;
  className?: string;
}

export function AITokenUsage({ tokens, cost, model, responseTime, className }: AITokenUsageProps) {
  return (
    <div className={cn("flex items-center gap-3 text-[10px] text-foreground-muted", className)}>
      {model && <span>{model}</span>}
      <span>{tokens} tokens</span>
      <span>${cost.toFixed(6)}</span>
      {responseTime !== undefined && <span>{(responseTime / 1000).toFixed(1)}s</span>}
    </div>
  );
}
