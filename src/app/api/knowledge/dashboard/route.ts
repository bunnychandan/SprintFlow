import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

  const [totalBases, totalDocuments, publishedCount, draftCount, reviewCount, archivedCount, recentDocuments, popularDocuments, favoriteDocuments, bases] = await Promise.all([
    prisma.knowledgeBase.count(),
    prisma.document.count(),
    prisma.document.count({ where: { status: "PUBLISHED" } }),
    prisma.document.count({ where: { status: "DRAFT" } }),
    prisma.document.count({ where: { status: "REVIEW" } }),
    prisma.document.count({ where: { status: "ARCHIVED" } }),
    prisma.document.findMany({
      where: { archivedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { knowledgeBase: { select: { name: true } }, createdBy: { select: { name: true } }, updatedBy: { select: { name: true } }, reviewer: { select: { name: true } }, _count: { select: { comments: true, favorites: true } }, favorites: { where: { userId: user.id } } },
    }),
    prisma.document.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { knowledgeBase: { select: { name: true } }, createdBy: { select: { name: true } }, updatedBy: { select: { name: true } }, reviewer: { select: { name: true } }, _count: { select: { comments: true, favorites: true } }, favorites: { where: { userId: user.id } } },
    }),
    prisma.document.findMany({
      where: { favorites: { some: { userId: user.id } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { knowledgeBase: { select: { name: true } }, createdBy: { select: { name: true } }, updatedBy: { select: { name: true } }, reviewer: { select: { name: true } }, _count: { select: { comments: true, favorites: true } }, favorites: { where: { userId: user.id } } },
    }),
    prisma.knowledgeBase.findMany({
      include: { _count: { select: { documents: true } }, createdBy: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  const mapDoc = (d: typeof recentDocuments[0]) => ({
    id: d.id, knowledgeBaseId: d.knowledgeBaseId, parentId: d.parentId, title: d.title, slug: d.slug, content: null, excerpt: d.excerpt, status: d.status as any,
    visibility: d.visibility as any, type: d.type as any, version: d.version, coverImage: d.coverImage, icon: d.icon,
    createdById: d.createdById, updatedById: d.updatedById, reviewerId: d.reviewerId,
    publishedAt: d.publishedAt?.toISOString() || null, archivedAt: d.archivedAt?.toISOString() || null,
    createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    knowledgeBaseName: d.knowledgeBase.name, createdByName: d.createdBy.name || "Unknown", updatedByName: d.updatedBy?.name || null,
    reviewerName: d.reviewer?.name || null, commentCount: d._count.comments, isFavorited: d.favorites.length > 0, childrenCount: 0,
  });

  return NextResponse.json({
    totalBases, totalDocuments, publishedCount, draftCount, reviewCount, archivedCount,
    recentDocuments: recentDocuments.map(mapDoc),
    popularDocuments: popularDocuments.map(mapDoc),
    favoriteDocuments: favoriteDocuments.map(mapDoc),
    bases: bases.map((b) => ({
      id: b.id, organizationId: b.organizationId, name: b.name, description: b.description, slug: b.slug,
      icon: b.icon, color: b.color, createdById: b.createdById, archivedAt: null,
      createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(),
      documentCount: b._count.documents, createdByName: b.createdBy.name || "Unknown",
    })),
  });
}
