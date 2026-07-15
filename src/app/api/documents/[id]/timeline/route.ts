import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, createdAt: true, updatedAt: true, publishedAt: true, archivedAt: true, createdBy: { select: { name: true } }, updatedBy: { select: { name: true } }, reviewer: { select: { name: true } } },
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const events: { id: string; documentId: string; action: string; actorName: string | null; timestamp: string }[] = [];
  let idx = 0;

  events.push({ id: `${id}-created-${idx++}`, documentId: id, action: "created", actorName: doc.createdBy.name, timestamp: doc.createdAt.toISOString() });
  if (doc.updatedAt > doc.createdAt) {
    events.push({ id: `${id}-updated-${idx++}`, documentId: id, action: "updated", actorName: doc.updatedBy?.name || null, timestamp: doc.updatedAt.toISOString() });
  }
  if (doc.publishedAt) {
    events.push({ id: `${id}-published-${idx++}`, documentId: id, action: "published", actorName: doc.reviewer?.name || doc.updatedBy?.name || null, timestamp: doc.publishedAt.toISOString() });
  }
  if (doc.archivedAt) {
    events.push({ id: `${id}-archived-${idx++}`, documentId: id, action: "archived", actorName: doc.updatedBy?.name || null, timestamp: doc.archivedAt.toISOString() });
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(events);
}
