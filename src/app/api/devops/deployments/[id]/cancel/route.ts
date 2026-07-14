import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;
  const deployment = await prisma.deployment.findUnique({ where: { id } });
  if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  if (deployment.status !== "RUNNING" && deployment.status !== "PENDING") {
    return NextResponse.json({ error: "Cannot cancel deployment in current state" }, { status: 400 });
  }

  const now = new Date();
  const duration = deployment.startedAt ? Math.round((now.getTime() - deployment.startedAt.getTime()) / 1000) : 0;

  const updated = await prisma.deployment.update({
    where: { id },
    data: { status: "CANCELLED", completedAt: now, duration },
  });

  await prisma.auditLog.create({
    data: { actorId: authz.user?.id ?? authz.session?.user?.id, entityType: "DEPLOYMENT", entityId: id, action: "CANCEL", details: `Deployment cancelled: ${deployment.version} to ${deployment.environment}` },
  });

  return NextResponse.json({ ...updated, startedAt: updated.startedAt?.toISOString(), completedAt: updated.completedAt?.toISOString(), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
}
