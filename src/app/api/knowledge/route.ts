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
    const search = searchParams.get("search");
    const archived = searchParams.get("archived");

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (archived === "true") where.archivedAt = { not: null };
    else if (archived === "false") where.archivedAt = null;

    const [total, items] = await Promise.all([
      prisma.knowledgeBase.count({ where: where as any }),
      prisma.knowledgeBase.findMany({
        where: where as any,
        include: { _count: { select: { documents: true } }, createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      data: items.map((kb) => ({
        id: kb.id, organizationId: kb.organizationId, name: kb.name, description: kb.description,
        slug: kb.slug, icon: kb.icon, color: kb.color, createdById: kb.createdById,
        createdByName: kb.createdBy.name, documentCount: kb._count.documents,
        archivedAt: kb.archivedAt?.toISOString() || null,
        createdAt: kb.createdAt.toISOString(), updatedAt: kb.updatedAt.toISOString(),
      })),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/knowledge");
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const body = await request.json();
    const { name, description, slug, icon, color } = body;
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const kbSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const existing = await prisma.knowledgeBase.findUnique({ where: { organizationId_slug: { organizationId: org.id, slug: kbSlug } } });
    if (existing) return NextResponse.json({ error: "A knowledge base with this slug already exists" }, { status: 409 });

    const kb = await prisma.knowledgeBase.create({
      data: { organizationId: org.id, name, description, slug: kbSlug, icon, color: color || "#6366f1", createdById: authz.user!.id },
      include: { createdBy: { select: { name: true } }, _count: { select: { documents: true } } },
    });

    await prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "KNOWLEDGE_BASE", entityId: kb.id, action: "CREATE", success: true } });

    return NextResponse.json({
      id: kb.id, organizationId: kb.organizationId, name: kb.name, description: kb.description,
      slug: kb.slug, icon: kb.icon, color: kb.color, createdById: kb.createdById,
      createdByName: kb.createdBy.name, documentCount: kb._count.documents,
      archivedAt: null, createdAt: kb.createdAt.toISOString(), updatedAt: kb.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/knowledge");
  }
}
