import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, title: true, description: true, status: true, priority: true, type: true, storyPoints: true, dueDate: true, createdAt: true, reporter: { select: { name: true } }, assignee: { select: { name: true } }, project: { select: { name: true, code: true } }, sprint: { select: { name: true } }, _count: { select: { comments: true } } },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ task: { ...task, dueDate: task.dueDate?.toISOString() || null, createdAt: task.createdAt.toISOString() } });
}
