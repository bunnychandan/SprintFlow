import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: "insensitive" };

  const pipelines = await prisma.pipeline.findMany({
    where: where as any,
    include: { project: { select: { name: true, code: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return NextResponse.json(pipelines.map((p) => ({
    id: p.id, projectId: p.projectId, projectName: p.project.name, projectCode: p.project.code,
    name: p.name, provider: p.provider, status: p.status,
    lastRun: p.lastRun?.toISOString() || null, duration: p.duration,
    successCount: p.successCount, failureCount: p.failureCount,
    configuration: p.configuration, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
  })));
}

export async function POST(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const body = await request.json();
  const { projectId, name, provider, configuration } = body;

  if (!projectId || !name) {
    return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
  }

  const pipeline = await prisma.pipeline.create({
    data: { projectId, name, provider: provider || "CUSTOM", configuration: configuration || undefined },
    include: { project: { select: { name: true, code: true } } },
  });

  return NextResponse.json({
    id: pipeline.id, projectId: pipeline.projectId, projectName: pipeline.project.name, projectCode: pipeline.project.code,
    name: pipeline.name, provider: pipeline.provider, status: pipeline.status,
    lastRun: null, duration: null, successCount: 0, failureCount: 0,
    configuration: pipeline.configuration, createdAt: pipeline.createdAt.toISOString(), updatedAt: pipeline.updatedAt.toISOString(),
  }, { status: 201 });
}
