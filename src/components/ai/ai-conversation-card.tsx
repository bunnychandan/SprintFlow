"use client";

import { cn } from "@/lib/cn";
import { MessageSquare, Bot } from "lucide-react";
import type { AIConversationItem } from "@/types/ai";

interface AIConversationCardProps {
  conversation: AIConversationItem;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export function AIConversationCard({ conversation, isActive, onClick, className }: AIConversationCardProps) {
  return (
    <button onClick={onClick} className={cn("w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex items-center gap-2", isActive ? "bg-accent-light text-accent font-medium" : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground", className)}>
      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate flex-1">{conversation.title}</span>
      <span className="text-[10px] text-foreground-muted shrink-0">{conversation.messageCount}</span>
    </button>
  );
}
