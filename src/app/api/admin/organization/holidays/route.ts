import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { getOrCreateOrganization } from "@/lib/org";

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();
  const holidays = await prisma.holiday.findMany({
    where: { organizationId: org.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ holidays });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const org = await getOrCreateOrganization();

  let body: { name?: string; date?: string; type?: string; region?: string; recurring?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name || !body.date) {
    return NextResponse.json({ error: "name and date are required" }, { status: 400 });
  }

  const parsedDate = new Date(body.date);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const holiday = await prisma.holiday.create({
    data: {
      organizationId: org.id,
      name: body.name,
      date: parsedDate,
      type: body.type ?? "PUBLIC",
      region: body.region ?? null,
      recurring: body.recurring ?? false,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "ORGANIZATION",
      entityId: org.id,
      action: "CREATE_HOLIDAY",
      details: `Created holiday: ${body.name} on ${body.date}`,
    },
  });

  return NextResponse.json({ holiday }, { status: 201 });
}
