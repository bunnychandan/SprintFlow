"use client";

import { cn } from "@/lib/cn";
import { AIConversationCard } from "./ai-conversation-card";
import type { AIMessageItem } from "@/types/ai";

interface AIConversationHeaderProps {
  title: string;
  messageCount: number;
  agentType: string;
  provider: string;
  onRename?: (title: string) => void;
  onArchive?: () => void;
  className?: string;
}

export function AIConversationHeader({ title, messageCount, agentType, provider, onRename, onArchive, className }: AIConversationHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3 border-b border-border", className)}>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-foreground-muted">{agentType.replace(/_/g, " ")} · {provider} · {messageCount} messages</p>
      </div>
    </div>
  );
}
