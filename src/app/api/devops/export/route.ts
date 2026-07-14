import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const type = searchParams.get("type") || "deployments";

  if (type === "deployments") {
    const deployments = await prisma.deployment.findMany({
      include: { project: { select: { name: true, code: true } }, deployedBy: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    const rows = deployments.map((d) => ({
      version: d.version, environment: d.environment, status: d.status,
      project: d.project.name, branch: d.branch, commitHash: d.commitHash,
      deployedBy: d.deployedBy.name, startedAt: d.startedAt?.toISOString(),
      duration: d.duration,
    }));

    if (format === "csv") {
      const header = "Version,Environment,Status,Project,Branch,Commit,Deployed By,Started,Duration\n";
      const csv = header + rows.map((r) => `${r.version},${r.environment},${r.status},${r.project},${r.branch || ""},${r.commitHash || ""},${r.deployedBy},${r.startedAt || ""},${r.duration || ""}`).join("\n");
      return new NextResponse(csv, {
        headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="deployments.csv"' },
      });
    }

    return NextResponse.json(rows);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
