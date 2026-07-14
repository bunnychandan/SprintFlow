"use client";

import { cn } from "@/lib/cn";
import { Bot, User } from "lucide-react";
import type { AIMessageItem } from "@/types/ai";

interface AIMessageBubbleProps {
  message: AIMessageItem;
  className?: string;
}

export function AIMessageBubble({ message, className }: AIMessageBubbleProps) {
  const isUser = message.role === "USER";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row", className)}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isUser ? "bg-accent-light text-accent" : "bg-surface-hover text-foreground")}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", isUser ? "bg-accent text-white" : "bg-surface border border-border")}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className={cn("flex items-center gap-2 mt-1", isUser ? "justify-end" : "justify-start")}>
          <span className={cn("text-[10px]", isUser ? "text-white/60" : "text-foreground-muted")}>
            {message.model && `${message.model} · `}{message.tokenCount > 0 && `${message.tokenCount} tokens`}
          </span>
        </div>
      </div>
    </div>
  );
}
