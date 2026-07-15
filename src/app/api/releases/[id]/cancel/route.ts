import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const release = await prisma.release.findUnique({ where: { id } });
  if (!release || release.archivedAt) return NextResponse.json({ error: "Release not found" }, { status: 404 });

  if (release.status === "RELEASED") {
    return NextResponse.json({ error: "Cannot cancel a published release" }, { status: 400 });
  }

  if (release.status === "CANCELLED") {
    return NextResponse.json({ error: "Release is already cancelled" }, { status: 400 });
  }

  const authz = await requireProjectAccess(release.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const actorId = authz.user?.id ?? authz.session?.user?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const updated = await prisma.release.update({
    where: { id },
    data: { status: "CANCELLED", updatedById: actorId },
  });

  await prisma.auditLog.create({
    data: { actorId, entityType: "RELEASE", entityId: id, action: "CANCEL_RELEASE", details: `Cancelled release "${release.name}"`, projectId: release.projectId },
  });

  return NextResponse.json({ release: updated });
}
