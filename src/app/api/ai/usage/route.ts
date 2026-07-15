import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: Request) {
  try {
    const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
    if (!authz.ok) return NextResponse.json({ error: "Unauthorized" }, { status: authz.status });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "daily";
    const provider = searchParams.get("provider");
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const isAdmin = authz.user!.role === "SUPER_ADMIN" || authz.user!.role === "ADMIN";
    const where: Record<string, unknown> = {};
    if (provider) where.provider = provider;
    if (!isAdmin) where.userId = authz.user!.id;
    else if (userId) where.userId = userId;
    if (from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(from) } as any;
    if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to) } as any;

    const allRecords = await prisma.aIUsage.findMany({ where: where as any, orderBy: { createdAt: "desc" } });

    const totalTokens = allRecords.reduce((s, r) => s + r.tokens, 0);
    const totalRequests = allRecords.reduce((s, r) => s + r.requests, 0);
    const totalCost = allRecords.reduce((s, r) => s + r.cost, 0);

    const dailyMap = new Map<string, { tokens: number; requests: number; cost: number }>();
    const userMap = new Map<string, { tokens: number; requests: number; cost: number }>();
    const modelMap = new Map<string, { tokens: number; requests: number; cost: number }>();
    const providerMap = new Map<string, { tokens: number; requests: number; cost: number }>();

    for (const r of allRecords) {
      const day = r.createdAt.toISOString().split("T")[0];
      const d = dailyMap.get(day) || { tokens: 0, requests: 0, cost: 0 };
      d.tokens += r.tokens; d.requests += r.requests; d.cost += r.cost;
      dailyMap.set(day, d);

      const p = providerMap.get(r.provider) || { tokens: 0, requests: 0, cost: 0 };
      p.tokens += r.tokens; p.requests += r.requests; p.cost += r.cost;
      providerMap.set(r.provider, p);

      if (r.model) {
        const m = modelMap.get(r.model) || { tokens: 0, requests: 0, cost: 0 };
        m.tokens += r.tokens; m.requests += r.requests; m.cost += r.cost;
        modelMap.set(r.model, m);
      }

      const u = userMap.get(r.userId) || { tokens: 0, requests: 0, cost: 0 };
      u.tokens += r.tokens; u.requests += r.requests; u.cost += r.cost;
      userMap.set(r.userId, u);
    }

    const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));

    const userNames = await prisma.user.findMany({ where: { id: { in: Array.from(userMap.keys()) } }, select: { id: true, name: true } });
    const userNameMap = new Map(userNames.map((u) => [u.id, u.name]));

    return NextResponse.json({
      totalTokens, totalRequests, totalCost,
      daily,
      byUser: Array.from(userMap.entries()).map(([uid, v]) => ({ userId: uid, userName: userNameMap.get(uid) || null, ...v })),
      byModel: Array.from(modelMap.entries()).map(([model, v]) => ({ model, ...v })),
      byProvider: Array.from(providerMap.entries()).map(([prov, v]) => ({ provider: prov, ...v })),
    });
  } catch (error) {
    return handleApiError(error, "GET /api/ai/usage");
  }
}
