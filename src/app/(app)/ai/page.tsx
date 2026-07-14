"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConversations, useConversationActions, useAIChat, useConversation } from "@/hooks/use-ai";
import { AIConversationSidebar } from "@/components/ai/ai-conversation-sidebar";
import { AIChatWindow } from "@/components/ai/ai-chat-window";
import { AIInput } from "@/components/ai/ai-input";
import { AIConversationHeader } from "@/components/ai/ai-conversation-header";
import { AIEmptyState } from "@/components/ai/ai-empty-state";
import { AIProviderSelector } from "@/components/ai/ai-provider-selector";

export default function AIPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [provider, setProvider] = useState("OPENAI");
  const { data: conversations, loading: listLoading, refetch } = useConversations();
  const { data: activeConversation, refetch: refetchConv } = useConversation(activeId);
  const { create } = useConversationActions();
  const { send, loading: chatLoading } = useAIChat();

  const handleNew = useCallback(async () => {
    const conv = await create({ provider: provider as any });
    if (conv) { setActiveId(conv.id); refetch(); }
  }, [create, provider, refetch]);

  const handleSend = useCallback(async (message: string) => {
    const result = await send({ conversationId: activeId || undefined, message, provider: provider as any });
    if (result) {
      if (!activeId) setActiveId(result.conversationId);
      refetchConv();
      refetch();
    }
  }, [activeId, provider, send, refetchConv, refetch]);

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-6 -mb-6">
      <div className="w-64 shrink-0 border-r border-border bg-background">
        <AIConversationSidebar conversations={conversations.data} activeId={activeId || undefined} onSelect={setActiveId} onNew={handleNew} loading={listLoading} />
      </div>
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between px-4 border-b border-border">
              <AIConversationHeader title={activeConversation.title} messageCount={activeConversation.messageCount} agentType={activeConversation.agentType} provider={activeConversation.provider} />
              <AIProviderSelector value={provider} onChange={setProvider} />
            </div>
            <AIChatWindow messages={activeConversation.messages || []} loading={chatLoading} />
            <AIInput onSend={handleSend} loading={chatLoading} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <AIEmptyState description="Select a conversation or start a new chat." />
            <div className="mt-4 flex items-center gap-2">
              <AIProviderSelector value={provider} onChange={setProvider} />
              <button onClick={handleNew} className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors">Start New Chat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
