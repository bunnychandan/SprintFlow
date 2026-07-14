import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;
  const deployment = await prisma.deployment.findUnique({ where: { id } });
  if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  if (deployment.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending deployments can be started" }, { status: 400 });
  }

  const updated = await prisma.deployment.update({
    where: { id },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: { actorId: authz.user?.id ?? authz.session?.user?.id, entityType: "DEPLOYMENT", entityId: id, action: "START", details: `Deployment started: ${deployment.version} to ${deployment.environment}` },
  });

  return NextResponse.json({ ...updated, startedAt: updated.startedAt?.toISOString(), createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
}
