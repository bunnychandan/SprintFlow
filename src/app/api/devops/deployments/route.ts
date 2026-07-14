import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const environment = searchParams.get("environment");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (environment) where.environment = environment;
  if (status) where.status = status;
  if (from || to) {
    where.startedAt = {};
    if (from) (where.startedAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startedAt as Record<string, unknown>).lte = new Date(to);
  }

  const [total, deployments] = await Promise.all([
    prisma.deployment.count({ where: where as any }),
    prisma.deployment.findMany({
      where: where as any,
      include: { project: { select: { name: true, code: true } }, deployedBy: { select: { name: true } }, release: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: deployments.map((d) => ({
      id: d.id, projectId: d.projectId, projectName: d.project.name, projectCode: d.project.code,
      releaseId: d.releaseId, releaseName: d.release?.name || null, version: d.version,
      environment: d.environment, status: d.status, commitHash: d.commitHash, branch: d.branch,
      deployedById: d.deployedById, deployedByName: d.deployedBy.name,
      startedAt: d.startedAt?.toISOString() || null, completedAt: d.completedAt?.toISOString() || null,
      duration: d.duration, logs: d.logs, rollbackFromId: d.rollbackFromId,
      createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    })),
    total, page, pageSize, totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Only admins can create deployments" }, { status: 403 });
  }

  const body = await request.json();
  const { projectId, version, environment, releaseId, commitHash, branch } = body;

  if (!projectId || !version || !environment) {
    return NextResponse.json({ error: "projectId, version, and environment are required" }, { status: 400 });
  }

  if (environment === "PRODUCTION" && user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only SUPER_ADMIN can deploy to production" }, { status: 403 });
  }

  const project = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (project.status === "ARCHIVED") return NextResponse.json({ error: "Cannot deploy archived projects" }, { status: 400 });

  if (releaseId) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release || release.status === "CANCELLED") return NextResponse.json({ error: "Cannot deploy cancelled releases" }, { status: 400 });
  }

  const deployment = await prisma.deployment.create({
    data: { projectId, releaseId: releaseId || null, version, environment, commitHash: commitHash || null, branch: branch || null, deployedById: session.user.id },
    include: { project: { select: { name: true, code: true } }, deployedBy: { select: { name: true } }, release: { select: { name: true } } },
  });

  await prisma.auditLog.create({
    data: { actorId: session.user.id, entityType: "DEPLOYMENT", entityId: deployment.id, action: "CREATE", details: `Deployment created: ${version} to ${environment}` },
  });

  return NextResponse.json({
    id: deployment.id, projectId: deployment.projectId, projectName: deployment.project.name, projectCode: deployment.project.code,
    releaseId: deployment.releaseId, releaseName: deployment.release?.name || null, version: deployment.version,
    environment: deployment.environment, status: deployment.status, commitHash: deployment.commitHash, branch: deployment.branch,
    deployedById: deployment.deployedById, deployedByName: deployment.deployedBy.name,
    startedAt: null, completedAt: null, duration: null, logs: null, rollbackFromId: null,
    createdAt: deployment.createdAt.toISOString(), updatedAt: deployment.updatedAt.toISOString(),
  }, { status: 201 });
}
