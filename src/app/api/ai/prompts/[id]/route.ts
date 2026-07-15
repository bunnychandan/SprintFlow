import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error-handler";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { id } = await params;
    const body = await request.json();
    const { name, category, description, prompt, isPublic } = body;

    const existing = await prisma.aIPromptTemplate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updated = await prisma.aIPromptTemplate.update({ where: { id }, data: updateData, include: { createdBy: { select: { name: true } } } });

    return NextResponse.json({ id: updated.id, organizationId: updated.organizationId, name: updated.name, category: updated.category, description: updated.description, prompt: updated.prompt, createdById: updated.createdById, createdByName: updated.createdBy.name, isPublic: updated.isPublic, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (error) {
    return handleApiError(error, "PUT /api/ai/prompts/[id]");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { id } = await params;
    const existing = await prisma.aIPromptTemplate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.aIPromptTemplate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "DELETE /api/ai/prompts/[id]");
  }
}
