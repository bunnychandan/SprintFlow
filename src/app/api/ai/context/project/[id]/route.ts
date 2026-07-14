import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true, code: true, description: true, status: true, startDate: true, targetDate: true, _count: { select: { tasks: true, members: true, sprints: true } } },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ project: { ...project, startDate: project.startDate?.toISOString() || null, targetDate: project.targetDate?.toISOString() || null } });
}
