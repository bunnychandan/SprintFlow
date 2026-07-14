"use client";

import { useParams, useRouter } from "next/navigation";
import { useConversation, useAIChat } from "@/hooks/use-ai";
import { AIChatWindow } from "@/components/ai/ai-chat-window";
import { AIInput } from "@/components/ai/ai-input";
import { AIConversationHeader } from "@/components/ai/ai-conversation-header";
import { AILoadingMessage } from "@/components/ai/ai-loading-message";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data, loading, refetch } = useConversation(id);
  const { send, loading: chatLoading } = useAIChat();

  const handleSend = async (message: string) => {
    await send({ conversationId: id, message });
    refetch();
  };

  if (loading) return <div className="flex items-center justify-center h-full"><AILoadingMessage /></div>;
  if (!data) return <div className="flex items-center justify-center h-full text-foreground-muted">Conversation not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-4 border-b border-border">
        <button onClick={() => router.push("/ai")} className="p-1.5 rounded-lg hover:bg-surface-hover text-foreground-muted"><ArrowLeft className="h-4 w-4" /></button>
        <AIConversationHeader title={data.title} messageCount={data.messageCount} agentType={data.agentType} provider={data.provider} />
      </div>
      <AIChatWindow messages={data.messages || []} loading={chatLoading} />
      <AIInput onSend={handleSend} loading={chatLoading} />
    </div>
  );
}
