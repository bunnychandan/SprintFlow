import type { SystemHealth } from "@/types/admin";

export async function getSystemHealth(): Promise<SystemHealth> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("System health check failed");
  return res.json();
}
