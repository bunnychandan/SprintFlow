import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const original = await prisma.document.findUnique({
    where: { id },
    include: { children: true },
  });
  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const targetKnowledgeBaseId = body.targetKnowledgeBaseId || original.knowledgeBaseId;
  const includeChildren = body.includeChildren || false;

  const slug = `${original.slug}-copy-${Date.now()}`;

  const duplicate = await prisma.$transaction(async (tx) => {
    const created = await tx.document.create({
      data: { knowledgeBaseId: targetKnowledgeBaseId, parentId: original.parentId, title: `${original.title} (Copy)`, slug, content: original.content, excerpt: original.excerpt, type: original.type, visibility: original.visibility, icon: original.icon, coverImage: original.coverImage, createdById: authz.user!.id, updatedById: authz.user!.id },
    });

    await tx.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: created.id, action: "DUPLICATE", metadata: { originalId: id }, success: true } });

    return created;
  });

  return NextResponse.json({ id: duplicate.id, title: duplicate.title, slug: duplicate.slug });
}
