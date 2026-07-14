import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const userId = authz.user?.id ?? authz.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.projectFavorite.upsert({
    where: { projectId_userId: { projectId: id, userId } },
    create: { projectId: id, userId },
    update: {},
  });

  return NextResponse.json({ message: "Project added to favorites" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authz = await requireProjectAccess(id);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const userId = authz.user?.id ?? authz.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.projectFavorite.deleteMany({
    where: { projectId: id, userId },
  });

  return NextResponse.json({ message: "Project removed from favorites" });
}
