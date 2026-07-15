import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const body = await request.json();
  const { version } = body;

  if (!version) return NextResponse.json({ error: "Version is required" }, { status: 400 });

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versionRecord = await prisma.documentVersion.findUnique({ where: { documentId_version: { documentId: id, version } } });
  if (!versionRecord) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const [updated] = await prisma.$transaction([
    prisma.document.update({
      where: { id },
      data: { title: versionRecord.title, content: versionRecord.content, version: doc.version + 1, updatedById: authz.user!.id },
    }),
    prisma.documentVersion.create({
      data: { documentId: id, version: doc.version + 1, title: versionRecord.title, content: versionRecord.content, createdById: authz.user!.id },
    }),
    prisma.auditLog.create({ data: { actorId: authz.user!.id, entityType: "DOCUMENT", entityId: id, action: "VERSION_RESTORE", metadata: { restoredVersion: version }, success: true } }),
  ]);

  return NextResponse.json({ id: updated.id, version: updated.version, title: updated.title, content: updated.content });
}
