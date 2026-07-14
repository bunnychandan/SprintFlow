import { prisma } from "@/lib/prisma";

export async function createTaskHistory(before: any, after: Record<string, unknown>, userId: string, taskId: string) {
  const entries: Array<{ taskId: string; userId: string; field: string; oldValue: string | null; newValue: string | null }> = [];

  for (const [key, value] of Object.entries(after)) {
    if (key === "updatedById") continue;
    const beforeVal = (before as any)[key];
    const beforeStr = beforeVal instanceof Date ? beforeVal.toISOString() : beforeVal != null ? String(beforeVal) : null;
    const afterStr = value instanceof Date ? value.toISOString() : value != null ? String(value) : null;
    if (beforeStr !== afterStr) {
      entries.push({ taskId, userId, field: key, oldValue: beforeStr, newValue: afterStr });
    }
  }

  if (entries.length === 0) return;

  await prisma.taskHistory.createMany({ data: entries });
}
