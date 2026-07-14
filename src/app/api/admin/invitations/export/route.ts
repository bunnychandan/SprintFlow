import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  const filter: Record<string, string> = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const invitations = await prisma.invitation.findMany({
    where: filter as any,
    include: { sender: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = "Email,Type,Status,Sender,Sender Email,Expires At,Accepted At,Created At\n";
  const rows = invitations.map((inv) => {
    const escaped = (s: string | null | undefined) => {
      if (!s) return "";
      return `"${s.replace(/"/g, '""')}"`;
    };
    return [
      escaped(inv.email),
      inv.type,
      inv.status,
      escaped(inv.sender.name),
      escaped(inv.sender.email),
      inv.expiresAt.toISOString(),
      inv.acceptedAt ? inv.acceptedAt.toISOString() : "",
      inv.createdAt.toISOString(),
    ].join(",");
  }).join("\n");

  const csv = "\uFEFF" + header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invitations-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
