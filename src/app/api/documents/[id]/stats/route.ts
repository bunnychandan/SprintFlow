import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { _count: { select: { comments: true, versions: true } }, versions: { distinct: ["createdById"], select: { createdById: true } } },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id,
    documentId: id,
    totalComments: doc._count.comments,
    totalVersions: doc._count.versions,
    totalViews: 0,
    totalEdits: doc._count.versions,
    totalContributors: doc.versions.length,
    completion: 0,
  });
}
