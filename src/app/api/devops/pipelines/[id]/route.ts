import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: { project: { select: { name: true, code: true } } },
  });

  if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  return NextResponse.json({
    id: pipeline.id,
    projectId: pipeline.projectId,
    projectName: pipeline.project.name,
    projectCode: pipeline.project.code,
    name: pipeline.name,
    provider: pipeline.provider,
    status: pipeline.status,
    lastRun: pipeline.lastRun?.toISOString() || null,
    duration: pipeline.duration,
    successCount: pipeline.successCount,
    failureCount: pipeline.failureCount,
    configuration: pipeline.configuration,
    createdAt: pipeline.createdAt.toISOString(),
    updatedAt: pipeline.updatedAt.toISOString(),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.pipeline.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  const updated = await prisma.pipeline.update({
    where: { id },
    data: {
      name: body.name,
      provider: body.provider,
      configuration: body.configuration,
    },
    include: { project: { select: { name: true, code: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    projectId: updated.projectId,
    projectName: updated.project.name,
    projectCode: updated.project.code,
    name: updated.name,
    provider: updated.provider,
    status: updated.status,
    lastRun: updated.lastRun?.toISOString() || null,
    duration: updated.duration,
    successCount: updated.successCount,
    failureCount: updated.failureCount,
    configuration: updated.configuration,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}
