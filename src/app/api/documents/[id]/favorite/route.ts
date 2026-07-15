import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const existing = await prisma.documentFavorite.findUnique({ where: { userId_documentId: { userId: authz.user!.id, documentId: id } } });

  if (existing) {
    await prisma.documentFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFavorited: false });
  }

  await prisma.documentFavorite.create({ data: { userId: authz.user!.id, documentId: id } });
  return NextResponse.json({ isFavorited: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const existing = await prisma.documentFavorite.findUnique({ where: { userId_documentId: { userId: authz.user!.id, documentId: id } } });
  if (existing) {
    await prisma.documentFavorite.delete({ where: { id: existing.id } });
  }

  return NextResponse.json({ success: true });
}
