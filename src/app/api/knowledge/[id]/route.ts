import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const kb = await prisma.knowledgeBase.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true } }, _count: { select: { documents: true } }, documents: { include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } } }, orderBy: { createdAt: "desc" } } },
    });

    if (!kb) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      id: kb.id, organizationId: kb.organizationId, name: kb.name, description: kb.description,
      slug: kb.slug, icon: kb.icon, color: kb.color, createdById: kb.createdById,
      createdByName: kb.createdBy.name, documentCount: kb._count.documents,
      archivedAt: kb.archivedAt?.toISOString() || null,
      createdAt: kb.createdAt.toISOString(), updatedAt: kb.updatedAt.toISOString(),
      documents: kb.documents.map((d) => ({
        id: d.id, knowledgeBaseId: d.knowledgeBaseId, parentId: d.parentId, title: d.title, slug: d.slug,
        excerpt: d.excerpt, status: d.status, visibility: d.visibility, type: d.type, version: d.version,
        coverImage: d.coverImage, icon: d.icon, createdById: d.createdById, createdByName: d.createdBy.name,
        updatedById: d.updatedById, reviewerId: d.reviewerId,
        publishedAt: d.publishedAt?.toISOString() || null, archivedAt: d.archivedAt?.toISOString() || null,
        createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
        childCount: d._count.children, commentCount: d._count.comments, isFavorited: false,
      })),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/knowledge/[id]");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const kb = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!kb) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const { name, description, slug, icon, color } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (slug !== undefined) {
      const existing = await prisma.knowledgeBase.findUnique({ where: { organizationId_slug: { organizationId: kb.organizationId, slug } } });
      if (existing && existing.id !== id) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
      updateData.slug = slug;
    }

    const updated = await prisma.knowledgeBase.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: { name: true } }, _count: { select: { documents: true } } },
    });

    await prisma.auditLog.create({ data: { actorId: session.user.id, entityType: "KNOWLEDGE_BASE", entityId: id, action: "UPDATE", success: true } });

    return NextResponse.json({
      id: updated.id, organizationId: updated.organizationId, name: updated.name, description: updated.description,
      slug: updated.slug, icon: updated.icon, color: updated.color, createdById: updated.createdById,
      createdByName: updated.createdBy.name, documentCount: updated._count.documents,
      archivedAt: updated.archivedAt?.toISOString() || null,
      createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/knowledge/[id]");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role === "USER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const kb = await prisma.knowledgeBase.findUnique({ where: { id } });
    if (!kb) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.knowledgeBase.delete({ where: { id } });
    await prisma.auditLog.create({ data: { actorId: session.user.id, entityType: "KNOWLEDGE_BASE", entityId: id, action: "DELETE", success: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/knowledge/[id]");
  }
}
