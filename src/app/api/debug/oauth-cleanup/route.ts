import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.DEBUG_AUTH_ROUTES !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const host = request.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  if (!isLocalhost && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const action = request.nextUrl.searchParams.get("action") || "check";

    if (action === "check") {
      const staleUsers = await prisma.user.findMany({
        where: { accounts: { none: {} } },
        include: { accounts: true },
      });

      return NextResponse.json({
        status: staleUsers.length > 0 ? "stale_found" : "clean",
        staleCount: staleUsers.length,
        staleUsers: staleUsers.map((u: any) => ({ id: u.id, email: u.email, role: u.role })),
      });
    }

    if (action === "cleanup") {
      const result = await prisma.user.deleteMany({
        where: { accounts: { none: {} } },
      });

      return NextResponse.json({ status: "cleaned", deletedCount: result.count });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Database cleanup error:", error);
    return NextResponse.json({ error: "Database cleanup failed" }, { status: 500 });
  }
}
