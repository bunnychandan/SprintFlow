import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const pipeline = await prisma.pipeline.findUnique({ where: { id } });
  if (!pipeline) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });

  if (pipeline.status === "RUNNING") {
    return NextResponse.json({ error: "Pipeline is already running" }, { status: 400 });
  }

  const now = new Date();
  const updated = await prisma.pipeline.update({
    where: { id },
    data: { status: "RUNNING", lastRun: now },
    include: { project: { select: { name: true, code: true } } },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      entityType: "PIPELINE",
      entityId: id,
      action: "RUN",
      details: `Pipeline run started: ${pipeline.name}`,
    },
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
