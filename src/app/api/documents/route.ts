import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search");
  const knowledgeBaseId = searchParams.get("knowledgeBaseId");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const visibility = searchParams.get("visibility");
  const parentIdParam = searchParams.get("parentId");
  const archived = searchParams.get("archived");

  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { excerpt: { contains: search, mode: "insensitive" } }];
  if (knowledgeBaseId) where.knowledgeBaseId = knowledgeBaseId;
  if (status) where.status = status;
  if (type) where.type = type;
  if (visibility) where.visibility = visibility;
  if (parentIdParam === "null") where.parentId = null;
  else if (parentIdParam) where.parentId = parentIdParam;
  if (archived === "true") where.archivedAt = { not: null };
  else if (archived === "false" || !archived) where.archivedAt = null;

  const [total, items] = await Promise.all([
    prisma.document.count({ where: where as any }),
    prisma.document.findMany({
      where: where as any,
      include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } }, favorites: { where: { userId: session.user.id }, select: { id: true } } },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: items.map((d) => ({
      id: d.id, knowledgeBaseId: d.knowledgeBaseId, parentId: d.parentId, title: d.title, slug: d.slug,
      excerpt: d.excerpt, status: d.status, visibility: d.visibility, type: d.type, version: d.version,
      coverImage: d.coverImage, icon: d.icon, createdById: d.createdById, createdByName: d.createdBy.name,
      updatedById: d.updatedById, reviewerId: d.reviewerId,
      publishedAt: d.publishedAt?.toISOString() || null, archivedAt: d.archivedAt?.toISOString() || null,
      createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
      childCount: d._count.children, commentCount: d._count.comments, isFavorited: d.favorites.length > 0,
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { knowledgeBaseId, parentId, title, slug, content, excerpt, type, visibility, icon, coverImage } = body;

  if (!knowledgeBaseId || !title) return NextResponse.json({ error: "knowledgeBaseId and title are required" }, { status: 400 });

  const kb = await prisma.knowledgeBase.findUnique({ where: { id: knowledgeBaseId } });
  if (!kb) return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });

  const docSlug = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 200);

  const existing = await prisma.document.findUnique({ where: { knowledgeBaseId_slug: { knowledgeBaseId, slug: docSlug } } });
  if (existing) return NextResponse.json({ error: "A document with this slug already exists in this knowledge base" }, { status: 409 });

  const doc = await prisma.document.create({
    data: { knowledgeBaseId, parentId: parentId || null, title, slug: docSlug, content, excerpt, type: type || "DOCUMENT", visibility: visibility || "ORGANIZATION", icon, coverImage, createdById: session.user.id, updatedById: session.user.id },
    include: { createdBy: { select: { name: true } }, _count: { select: { children: true, comments: true } }, favorites: { where: { userId: session.user.id }, select: { id: true } } },
  });

  await prisma.auditLog.create({ data: { actorId: session.user.id, entityType: "DOCUMENT", entityId: doc.id, action: "CREATE", success: true } });

  return NextResponse.json({
    id: doc.id, knowledgeBaseId: doc.knowledgeBaseId, parentId: doc.parentId, title: doc.title, slug: doc.slug,
    content: doc.content, excerpt: doc.excerpt, status: doc.status, visibility: doc.visibility, type: doc.type,
    version: doc.version, coverImage: doc.coverImage, icon: doc.icon, createdById: doc.createdById,
    createdByName: doc.createdBy.name, updatedById: doc.updatedById, reviewerId: doc.reviewerId,
    publishedAt: doc.publishedAt?.toISOString() || null, archivedAt: doc.archivedAt?.toISOString() || null,
    createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString(),
    childCount: doc._count.children, commentCount: doc._count.comments, isFavorited: doc.favorites.length > 0,
    children: [], comments: [], versions: [], parent: null, favorites: [],
  }, { status: 201 });
}
