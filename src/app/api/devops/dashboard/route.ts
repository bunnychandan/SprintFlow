import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const authz = await requireRole(["SUPER_ADMIN", "ADMIN", "USER"]);
  if (!authz.ok) return NextResponse.json({ error: "Forbidden" }, { status: authz.status });

  const [deployments, pipelines] = await Promise.all([
    prisma.deployment.findMany({ orderBy: { startedAt: "desc" }, take: 50 }),
    prisma.pipeline.findMany(),
  ]);

  const total = deployments.length;
  const success = deployments.filter((d) => d.status === "SUCCESS").length;
  const failed = deployments.filter((d) => d.status === "FAILED").length;
  const running = deployments.filter((d) => d.status === "RUNNING").length;
  const pending = deployments.filter((d) => d.status === "PENDING").length;

  const pipelineTotal = pipelines.length;
  const pipelineSuccess = pipelines.filter((p) => p.status === "SUCCESS").length;
  const pipelineFailed = pipelines.filter((p) => p.status === "FAILED").length;
  const pipelineRunning = pipelines.filter((p) => p.status === "RUNNING").length;

  const environments = ["DEVELOPMENT", "TESTING", "STAGING", "PRODUCTION"] as const;
  const envHealth = environments.map((env) => {
    const envDeps = deployments.filter((d) => d.environment === env);
    const envSuccess = envDeps.filter((d) => d.status === "SUCCESS").length;
    return {
      environment: env,
      status: envDeps.length === 0 ? "healthy" as const : failed > success ? "critical" as const : "healthy" as const,
      lastDeployed: envDeps[0]?.completedAt?.toISOString() || null,
      deploymentCount: envDeps.length,
      successRate: envDeps.length > 0 ? Math.round((envSuccess / envDeps.length) * 100) : 100,
    };
  });

  const trendMap = new Map<string, { count: number; failed: number }>();
  deployments.slice(0, 30).forEach((d) => {
    const date = (d.startedAt || d.createdAt).toISOString().split("T")[0];
    const t = trendMap.get(date) || { count: 0, failed: 0 };
    t.count++;
    if (d.status === "FAILED") t.failed++;
    trendMap.set(date, t);
  });
  const deploymentTrend = Array.from(trendMap.entries()).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date));

  const avgDuration = deployments.filter((d) => d.duration).reduce((s, d) => s + (d.duration || 0), 0) / Math.max(1, deployments.filter((d) => d.duration).length);

  return NextResponse.json({
    deployments: { total, success, failed, running, pending },
    pipelines: { total: pipelineTotal, success: pipelineSuccess, failed: pipelineFailed, running: pipelineRunning },
    environments: envHealth,
    recentDeployments: deployments.slice(0, 10).map((d) => ({
      id: d.id, projectId: d.projectId, projectName: "", projectCode: "",
      releaseId: d.releaseId, releaseName: null, version: d.version,
      environment: d.environment, status: d.status, commitHash: d.commitHash,
      branch: d.branch, deployedById: d.deployedById, deployedByName: null,
      startedAt: d.startedAt?.toISOString() || null, completedAt: d.completedAt?.toISOString() || null,
      duration: d.duration, logs: d.logs, rollbackFromId: d.rollbackFromId,
      createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    })),
    deploymentTrend,
    avgDuration: Math.round(avgDuration),
    successRate: total > 0 ? Math.round((success / total) * 100) : 100,
  });
}
