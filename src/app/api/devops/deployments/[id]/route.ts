import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deployment = await prisma.deployment.findUnique({
    where: { id },
    include: { project: { select: { name: true, code: true } }, deployedBy: { select: { name: true } }, release: { select: { name: true } }, rollbackFrom: { select: { id: true, version: true, status: true } } },
  });

  if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  return NextResponse.json({
    id: deployment.id, projectId: deployment.projectId, projectName: deployment.project.name, projectCode: deployment.project.code,
    releaseId: deployment.releaseId, releaseName: deployment.release?.name || null, version: deployment.version,
    environment: deployment.environment, status: deployment.status, commitHash: deployment.commitHash, branch: deployment.branch,
    deployedById: deployment.deployedById, deployedByName: deployment.deployedBy.name,
    startedAt: deployment.startedAt?.toISOString() || null, completedAt: deployment.completedAt?.toISOString() || null,
    duration: deployment.duration, logs: deployment.logs, rollbackFromId: deployment.rollbackFromId,
    createdAt: deployment.createdAt.toISOString(), updatedAt: deployment.updatedAt.toISOString(),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.deployment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  if (existing.status === "SUCCESS" || existing.status === "FAILED" || existing.status === "ROLLED_BACK") {
    return NextResponse.json({ error: "Cannot modify completed deployments" }, { status: 400 });
  }

  const updated = await prisma.deployment.update({
    where: { id },
    data: { version: body.version, environment: body.environment, commitHash: body.commitHash, branch: body.branch },
    include: { project: { select: { name: true, code: true } }, deployedBy: { select: { name: true } }, release: { select: { name: true } } },
  });

  return NextResponse.json({
    id: updated.id, projectId: updated.projectId, projectName: updated.project.name, projectCode: updated.project.code,
    releaseId: updated.releaseId, releaseName: updated.release?.name || null, version: updated.version,
    environment: updated.environment, status: updated.status, commitHash: updated.commitHash, branch: updated.branch,
    deployedById: updated.deployedById, deployedByName: updated.deployedBy.name,
    startedAt: updated.startedAt?.toISOString() || null, completedAt: updated.completedAt?.toISOString() || null,
    duration: updated.duration, logs: updated.logs, rollbackFromId: updated.rollbackFromId,
    createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString(),
  });
}
