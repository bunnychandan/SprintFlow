import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Only admins can rollback deployments" }, { status: 403 });
  }

  const { id } = await params;
  const deployment = await prisma.deployment.findUnique({ where: { id }, include: { project: true } });
  if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  if (deployment.status !== "SUCCESS") {
    return NextResponse.json({ error: "Only successful deployments can be rolled back" }, { status: 400 });
  }

  const rollback = await prisma.deployment.create({
    data: {
      projectId: deployment.projectId,
      releaseId: deployment.releaseId,
      version: `${deployment.version}-rollback`,
      environment: deployment.environment,
      status: "RUNNING",
      deployedById: session.user.id,
      rollbackFromId: id,
      startedAt: new Date(),
    },
  });

  await prisma.deployment.update({ where: { id }, data: { status: "ROLLED_BACK" } });

  await prisma.auditLog.create({
    data: { actorId: session.user.id, entityType: "DEPLOYMENT", entityId: rollback.id, action: "ROLLBACK", details: `Rollback of ${deployment.version} on ${deployment.environment}` },
  });

  return NextResponse.json({
    id: rollback.id, projectId: rollback.projectId, projectName: deployment.project.name, projectCode: deployment.project.code,
    releaseId: rollback.releaseId, releaseName: null, version: rollback.version,
    environment: rollback.environment, status: rollback.status, commitHash: null, branch: null,
    deployedById: rollback.deployedById, deployedByName: user.name,
    startedAt: rollback.startedAt?.toISOString() || null, completedAt: null,
    duration: null, logs: null, rollbackFromId: rollback.rollbackFromId,
    createdAt: rollback.createdAt.toISOString(), updatedAt: rollback.updatedAt.toISOString(),
  });
}
