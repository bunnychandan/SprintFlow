import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, title: true, description: true, status: true, priority: true, type: true, storyPoints: true, dueDate: true, createdAt: true, reporter: { select: { name: true } }, assignee: { select: { name: true } }, project: { select: { name: true, code: true } }, sprint: { select: { name: true } }, _count: { select: { comments: true } } },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ task: { ...task, dueDate: task.dueDate?.toISOString() || null, createdAt: task.createdAt.toISOString() } });
}
