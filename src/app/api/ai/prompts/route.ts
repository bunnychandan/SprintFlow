import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const [total, items] = await Promise.all([
      prisma.aIPromptTemplate.count({ where: where as any }),
      prisma.aIPromptTemplate.findMany({
        where: where as any,
        include: { createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      data: items.map((p) => ({ id: p.id, organizationId: p.organizationId, name: p.name, category: p.category, description: p.description, prompt: p.prompt, createdById: p.createdById, createdByName: p.createdBy.name, isPublic: p.isPublic, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
      pagination: { page: 1, pageSize: total, total, totalPages: 1 },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/ai/prompts");
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, category, description, prompt, isPublic } = body;
    if (!name || !prompt) return NextResponse.json({ error: "Name and prompt are required" }, { status: 400 });

    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const created = await prisma.aIPromptTemplate.create({
      data: { organizationId: org.id, name, category: category || "GENERAL", description, prompt, createdById: session.user.id, isPublic: isPublic || false },
      include: { createdBy: { select: { name: true } } },
    });

    return NextResponse.json({ id: created.id, organizationId: created.organizationId, name: created.name, category: created.category, description: created.description, prompt: created.prompt, createdById: created.createdById, createdByName: created.createdBy.name, isPublic: created.isPublic, createdAt: created.createdAt.toISOString(), updatedAt: created.updatedAt.toISOString() }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/ai/prompts");
  }
}
