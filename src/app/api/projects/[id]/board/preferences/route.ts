import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/authz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const preference = await prisma.boardPreference.findUnique({
    where: { projectId_userId: { projectId, userId: authz.user?.id ?? "" } },
  });

  return NextResponse.json(preference || {
    collapsedColumns: [],
    columnWidths: {},
    swimlane: "none",
    density: "normal",
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;

  const authz = await requireProjectAccess(projectId);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const userId = authz.user?.id ?? authz.session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const existing = await prisma.boardPreference.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  const preference = await prisma.boardPreference.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: {
      projectId,
      userId,
      collapsedColumns: body.collapsedColumns ?? [],
      columnWidths: body.columnWidths ?? {},
      swimlane: body.swimlane ?? "none",
      density: body.density ?? "normal",
    },
    update: {
      collapsedColumns: body.collapsedColumns ?? existing?.collapsedColumns ?? [],
      columnWidths: body.columnWidths ?? existing?.columnWidths ?? {},
      swimlane: body.swimlane ?? existing?.swimlane ?? "none",
      density: body.density ?? existing?.density ?? "normal",
    },
  });

  return NextResponse.json(preference);
}
