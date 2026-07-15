import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findFirst({
    where: { id },
    select: { id: true, title: true, excerpt: true, status: true, type: true, createdAt: true, createdBy: { select: { name: true } }, knowledgeBase: { select: { name: true } } },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ document: { ...doc, createdAt: doc.createdAt.toISOString() } });
}
