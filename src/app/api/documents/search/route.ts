import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const knowledgeBaseId = searchParams.get("knowledgeBaseId");
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

  const where: Record<string, unknown> = {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };
  if (knowledgeBaseId) where.knowledgeBaseId = knowledgeBaseId;
  if (status) where.status = status;
  if (type) where.type = type;

  const [total, items] = await Promise.all([
    prisma.document.count({ where: where as any }),
    prisma.document.findMany({
      where: where as any,
      select: { id: true, title: true, slug: true, excerpt: true, knowledgeBaseId: true, knowledgeBase: { select: { name: true } }, status: true, type: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: items.map((d) => ({ id: d.id, title: d.title, slug: d.slug, excerpt: d.excerpt, knowledgeBaseId: d.knowledgeBaseId, knowledgeBaseName: d.knowledgeBase.name, status: d.status, type: d.type, createdAt: d.createdAt.toISOString() })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
