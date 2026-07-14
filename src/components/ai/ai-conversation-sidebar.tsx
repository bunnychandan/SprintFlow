"use client";

import { cn } from "@/lib/cn";
import { AIConversationCard } from "./ai-conversation-card";
import type { AIConversationItem } from "@/types/ai";

interface AIConversationSidebarProps {
  conversations: AIConversationItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  loading?: boolean;
  className?: string;
}

export function AIConversationSidebar({ conversations, activeId, onSelect, onNew, loading, className }: AIConversationSidebarProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-3 border-b border-border">
        <button onClick={onNew} className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors">+ New Chat</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse h-9 rounded-lg bg-surface-hover" />)
        ) : conversations.length === 0 ? (
          <p className="text-xs text-foreground-muted text-center py-4">No conversations</p>
        ) : (
          conversations.map((c) => <AIConversationCard key={c.id} conversation={c} isActive={c.id === activeId} onClick={() => onSelect(c.id)} />)
        )}
      </div>
    </div>
  );
}
