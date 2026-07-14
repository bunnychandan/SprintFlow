import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import { parsePagination } from "@/lib/api-utils";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const search = searchParams.get("search") || "";
  const action = searchParams.get("action") || "";
  const entityType = searchParams.get("entityType") || "";
  const actorId = searchParams.get("actorId") || "";
  const success = searchParams.get("success") || "";
  const projectId = searchParams.get("projectId") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entityType: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
    ];
  }
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (actorId) where.actorId = actorId;
  if (success === "true") where.success = true;
  else if (success === "false") where.success = false;
  if (projectId) where.projectId = projectId;
  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
  }

  if (auth.user?.role !== "SUPER_ADMIN") {
    where.actorId = auth.user!.id;
  }

  const logs = await prisma.auditLog.findMany({
    where: where as any,
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  await prisma.auditLog.create({
    data: {
      actorId: auth.user!.id,
      entityType: "AUDIT",
      entityId: `export:${format}`,
      action: "EXPORT_AUDIT_LOG",
      details: `Exported ${logs.length} audit logs as ${format}`,
    },
  });

  if (format === "xlsx") {
    const header = "Timestamp,Actor,Actor Email,Action,Entity Type,Entity ID,Details,IP Address,Success\n";
    const rows = logs.map((log) => {
      const escape = (s: unknown) => {
        const str = String(s ?? "");
        return `"${str.replace(/"/g, '""')}"`;
      };
      return [
        escape(log.createdAt.toISOString()),
        escape(log.actor?.name),
        escape(log.actor?.email),
        escape(log.action),
        escape(log.entityType),
        escape(log.entityId),
        escape(log.details),
        escape(log.ipAddress),
        log.success === null ? "" : log.success ? "Yes" : "No",
      ].join(",");
    }).join("\n");

    const csv = "\uFEFF" + header + rows;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  const header = "Timestamp,Actor,Actor Email,Action,Entity Type,Entity ID,Details,IP Address,Success\n";
  const rows = logs.map((log) => {
    const escape = (s: unknown) => {
      const str = String(s ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };
    return [
      escape(log.createdAt.toISOString()),
      escape(log.actor?.name),
      escape(log.actor?.email),
      escape(log.action),
      escape(log.entityType),
      escape(log.entityId),
      escape(log.details),
      escape(log.ipAddress),
      log.success === null ? "" : log.success ? "Yes" : "No",
    ].join(",");
  }).join("\n");

  const csv = "\uFEFF" + header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-logs-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
