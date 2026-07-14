"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { AIMessageBubble } from "./ai-message-bubble";
import type { AIMessageItem } from "@/types/ai";

interface AIChatWindowProps {
  messages: AIMessageItem[];
  loading?: boolean;
  className?: string;
}

export function AIChatWindow({ messages, loading, className }: AIChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
      {messages.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-foreground-muted">
          <p className="text-sm">Start a conversation with the AI assistant</p>
        </div>
      )}
      {messages.map((msg) => <AIMessageBubble key={msg.id} message={msg} />)}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-foreground-muted pl-4">
          <div className="animate-pulse flex gap-1"><div className="h-2 w-2 rounded-full bg-accent animate-bounce" /><div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.2s" }} /></div>
          <span>AI is thinking...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
