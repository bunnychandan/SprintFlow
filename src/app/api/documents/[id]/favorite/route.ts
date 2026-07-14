import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.documentFavorite.findUnique({ where: { userId_documentId: { userId: session.user.id, documentId: id } } });

  if (existing) {
    await prisma.documentFavorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFavorited: false });
  }

  await prisma.documentFavorite.create({ data: { userId: session.user.id, documentId: id } });
  return NextResponse.json({ isFavorited: true }, { status: 201 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.documentFavorite.findUnique({ where: { userId_documentId: { userId: session.user.id, documentId: id } } });
  if (existing) {
    await prisma.documentFavorite.delete({ where: { id: existing.id } });
  }

  return NextResponse.json({ success: true });
}
