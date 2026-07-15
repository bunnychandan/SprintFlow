import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { id } = await params;
    const conversation = await prisma.aIConversation.findFirst({
      where: { id, userId: authz.user!.id },
      include: { messages: { orderBy: { createdAt: "asc" } }, _count: { select: { messages: true } } },
    });

    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: conversation.id, organizationId: conversation.organizationId, userId: conversation.userId,
      title: conversation.title, status: conversation.status, agentType: conversation.agentType,
      provider: conversation.provider, projectId: conversation.projectId, sprintId: conversation.sprintId,
      taskId: conversation.taskId, messageCount: conversation._count.messages,
      lastMessageAt: conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1].createdAt.toISOString() : null,
      createdAt: conversation.createdAt.toISOString(), updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map((m) => ({
        id: m.id, conversationId: m.conversationId, role: m.role, content: m.content,
        tokenCount: m.tokenCount, model: m.model, responseTime: m.responseTime,
        metadata: m.metadata, createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/ai/conversations/[id]");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { id } = await params;
    const body = await request.json();
    const { title, status, agentType, provider } = body;

    const conversation = await prisma.aIConversation.findFirst({ where: { id, userId: authz.user!.id } });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (agentType !== undefined) updateData.agentType = agentType;
    if (provider !== undefined) updateData.provider = provider;

    const updated = await prisma.aIConversation.update({ where: { id }, data: updateData, include: { _count: { select: { messages: true } } } });

    return NextResponse.json({
      id: updated.id, organizationId: updated.organizationId, userId: updated.userId,
      title: updated.title, status: updated.status, agentType: updated.agentType, provider: updated.provider,
      projectId: updated.projectId, sprintId: updated.sprintId, taskId: updated.taskId,
      messageCount: updated._count.messages, lastMessageAt: null,
      createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/ai/conversations/[id]");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { id } = await params;
    const conversation = await prisma.aIConversation.findFirst({ where: { id, userId: authz.user!.id } });
    if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.aIConversation.delete({ where: { id } });
    await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "AI_CONVERSATION", entityId: id, action: "DELETE", success: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/ai/conversations/[id]");
  }
}
