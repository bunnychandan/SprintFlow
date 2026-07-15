import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const where = { userId: authz.user!.id, status: "ACTIVE" as const };

    const [total, items] = await Promise.all([
      prisma.aIConversation.count({ where }),
      prisma.aIConversation.findMany({
        where,
        include: { _count: { select: { messages: true } } },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data: items.map((c) => ({
        id: c.id, organizationId: c.organizationId, userId: c.userId, title: c.title,
        status: c.status, agentType: c.agentType, provider: c.provider,
        projectId: c.projectId, sprintId: c.sprintId, taskId: c.taskId,
        messageCount: c._count.messages, lastMessageAt: null,
        createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/ai/conversations");
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const body = await request.json();
    const { title, agentType, provider, projectId, sprintId, taskId } = body;

    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: "Default Organization" },
      });
    }

    const conversation = await prisma.aIConversation.create({
      data: { organizationId: org.id, userId: authz.user!.id, title: title || "New Conversation", agentType: agentType || "GENERAL", provider: provider || "OPENAI", projectId, sprintId, taskId },
    });

    await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "AI_CONVERSATION", entityId: conversation.id, action: "CREATE", success: true } });

    return NextResponse.json({
      id: conversation.id, organizationId: conversation.organizationId, userId: conversation.userId,
      title: conversation.title, status: conversation.status, agentType: conversation.agentType,
      provider: conversation.provider, projectId: conversation.projectId, sprintId: conversation.sprintId,
      taskId: conversation.taskId, messageCount: 0, lastMessageAt: null,
      createdAt: conversation.createdAt.toISOString(), updatedAt: conversation.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/ai/conversations");
  }
}
