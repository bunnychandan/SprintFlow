import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      reviewer: { select: { name: true } },
      parent: { include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } }, favorites: { where: { userId: authz.user!.id }, select: { id: true } } } },
      children: { include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } }, favorites: { where: { userId: authz.user!.id }, select: { id: true } } }, orderBy: { title: "asc" } },
      comments: { include: { author: { select: { name: true, image: true } } }, orderBy: { createdAt: "desc" } },
      versions: { include: { createdBy: { select: { name: true } } }, orderBy: { version: "desc" }, take: 50 },
      favorites: { select: { userId: true } },
      _count: { select: { children: true, comments: true } },
    },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mapItem = (d: any) => ({
    id: d.id, knowledgeBaseId: d.knowledgeBaseId, parentId: d.parentId, title: d.title, slug: d.slug,
    excerpt: d.excerpt, status: d.status, visibility: d.visibility, type: d.type, version: d.version,
    coverImage: d.coverImage, icon: d.icon, createdById: d.createdById,
    createdByName: d.createdBy?.name || null, updatedById: d.updatedById, reviewerId: d.reviewerId,
    publishedAt: d.publishedAt?.toISOString() || null, archivedAt: d.archivedAt?.toISOString() || null,
    createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    childCount: d._count?.children || 0, commentCount: d._count?.comments || 0,
    isFavorited: d.favorites?.some((f: any) => f.userId === authz.user!.id) || false,
  });

  return NextResponse.json({
    ...mapItem(doc),
    content: doc.content,
    parent: doc.parent ? mapItem(doc.parent) : null,
    children: doc.children.map(mapItem),
    comments: doc.comments.map((c) => ({ id: c.id, documentId: c.documentId, authorId: c.authorId, authorName: c.author.name, authorImage: c.author.image, content: c.content, createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString() })),
    versions: doc.versions.map((v) => ({ id: v.id, documentId: v.documentId, version: v.version, title: v.title, content: v.content, createdById: v.createdById, createdByName: v.createdBy.name, createdAt: v.createdAt.toISOString() })),
    favorites: doc.favorites.map((f) => ({ userId: f.userId })),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { title, slug, content, excerpt, type, visibility, status, icon, coverImage, parentId } = body;

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (type !== undefined) updateData.type = type;
  if (visibility !== undefined) updateData.visibility = visibility;
  if (status !== undefined) updateData.status = status;
  if (icon !== undefined) updateData.icon = icon;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (parentId !== undefined) updateData.parentId = parentId || null;
  updateData.updatedById = authz.user!.id;

  if (slug !== undefined) {
    const existing = await prisma.document.findUnique({ where: { knowledgeBaseId_slug: { knowledgeBaseId: doc.knowledgeBaseId, slug } } });
    if (existing && existing.id !== id) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    updateData.slug = slug;
  }

  const isContentChange = content !== undefined && content !== doc.content;
  if (isContentChange) {
    updateData.version = doc.version + 1;
  }

  const [updated] = await prisma.$transaction(async (tx) => {
    const docUpdate = await tx.document.update({
      where: { id },
      data: updateData,
      include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } }, favorites: { where: { userId: authz.user!.id }, select: { id: true } } },
    });
    if (isContentChange) {
      await tx.documentVersion.create({
        data: { documentId: id, version: doc.version + 1, title: title || doc.title, content: content || doc.content, createdById: authz.user!.id },
      });
    }
    await tx.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: id, action: "UPDATE", success: true } });
    return [docUpdate];
  });

  return NextResponse.json({
    id: updated.id, knowledgeBaseId: updated.knowledgeBaseId, parentId: updated.parentId, title: updated.title, slug: updated.slug,
    content: updated.content, excerpt: updated.excerpt, status: updated.status, visibility: updated.visibility, type: updated.type,
    version: updated.version, coverImage: updated.coverImage, icon: updated.icon, createdById: updated.createdById,
    createdByName: updated.createdBy.name, updatedById: updated.updatedById, reviewerId: updated.reviewerId,
    publishedAt: updated.publishedAt?.toISOString() || null, archivedAt: updated.archivedAt?.toISOString() || null,
    createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
    childCount: updated._count.children, commentCount: updated._count.comments, isFavorited: updated.favorites.length > 0,
    children: [], comments: [], versions: [], parent: null, favorites: [],
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (doc.createdById !== authz.user!.id && authz.user!.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id } });
  await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: id, action: "DELETE", success: true } });

  return NextResponse.json({ success: true });
}
