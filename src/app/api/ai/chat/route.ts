import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { sendMessage, countTokens } from "@/lib/ai/provider-registry";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const body = await request.json();
    const { conversationId, message, provider, agentType, model, projectId, sprintId, taskId } = body;

    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const aiProvider = provider || "OPENAI";
    let conversation;

    if (conversationId) {
      conversation = await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: authz.user!.id } });
      if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    } else {
      const org = await prisma.organization.findFirst();
      if (!org) return NextResponse.json({ error: "No organization" }, { status: 404 });
      conversation = await prisma.aIConversation.create({
        data: { organizationId: org.id, userId: authz.user!.id, title: message.slice(0, 100), agentType: agentType || "GENERAL", provider: aiProvider, projectId, sprintId, taskId },
      });
    }

    const userMessage = await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: message, tokenCount: await countTokens(aiProvider, message) },
    });

    const context = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id, role: { in: ["USER", "ASSISTANT"] } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const contextStrings = context.map((m) => `${m.role}: ${m.content}`);
    const systemPrompt = agentType ? `You are a ${agentType} AI assistant for SprintFlow.` : undefined;

    const startTime = Date.now();
    let aiResponse;
    try {
      aiResponse = await sendMessage(aiProvider, message, contextStrings.slice(-10), { model, systemPrompt });
    } catch (err) {
      await prisma.aIMessage.create({
        data: { conversationId: conversation.id, role: "ASSISTANT", content: "I apologize, but I encountered an error processing your request. Please check your AI provider configuration.", tokenCount: 0, model: model || "unknown" },
      });
      return NextResponse.json({
        message: { id: "error", conversationId: conversation.id, role: "ASSISTANT", content: "AI service error. Please verify provider configuration.", tokenCount: 0, model: null, responseTime: Date.now() - startTime, metadata: null, createdAt: new Date().toISOString() },
        conversationId: conversation.id, tokenCount: 0, responseTime: Date.now() - startTime,
      });
    }

    const assistantMessage = await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: aiResponse.content, tokenCount: aiResponse.tokenCount.output, model: aiResponse.model, responseTime: aiResponse.responseTime },
    });

    await prisma.aIUsage.create({
      data: { organizationId: conversation.organizationId, userId: authz.user!.id, provider: aiProvider, model: aiResponse.model, tokens: aiResponse.tokenCount.input + aiResponse.tokenCount.output, requests: 1, cost: aiResponse.cost },
    });

    await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "AI_MESSAGE", entityId: assistantMessage.id, action: "CREATE", success: true } });

    return NextResponse.json({
      message: { id: assistantMessage.id, conversationId: assistantMessage.conversationId, role: assistantMessage.role, content: assistantMessage.content, tokenCount: assistantMessage.tokenCount, model: assistantMessage.model, responseTime: assistantMessage.responseTime, metadata: assistantMessage.metadata, createdAt: assistantMessage.createdAt.toISOString() },
      conversationId: conversation.id, tokenCount: aiResponse.tokenCount.input + aiResponse.tokenCount.output, responseTime: aiResponse.responseTime,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/ai/chat");
  }
}
