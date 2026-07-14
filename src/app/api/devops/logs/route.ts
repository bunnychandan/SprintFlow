import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const authz = await requireAdmin();
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get("deploymentId");

  if (!deploymentId) return NextResponse.json({ error: "deploymentId required" }, { status: 400 });

  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    select: { logs: true },
  });

  if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });

  const logs = deployment.logs ? deployment.logs.split("\n").filter(Boolean) : ["No logs available"];

  return NextResponse.json(logs);
}
