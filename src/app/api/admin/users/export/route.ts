import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const role = searchParams.get("role");
  const isActive = searchParams.get("isActive");

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (isActive === "true") where.isActive = true;
  if (isActive === "false") where.isActive = false;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      name: true, email: true, role: true, isActive: true,
      department: true, designation: true, lastLoginAt: true, createdAt: true,
    },
  });

  if (format === "json") {
    return NextResponse.json({ users });
  }

  const headers = ["Name", "Email", "Role", "Status", "Department", "Designation", "Last Login", "Created"];
  const rows = users.map((u) => [
    u.name || "",
    u.email,
    u.role,
    u.isActive ? "Active" : "Inactive",
    u.department || "",
    u.designation || "",
    u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
    new Date(u.createdAt).toISOString(),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
