import { prisma } from "@/lib/prisma";
import { createIntegrationSchema, updateIntegrationSchema } from "@/lib/integrations/validations";
import { getProviderForIntegration } from "@/lib/integrations/provider-registry";
import type { CreateIntegrationPayload, UpdateIntegrationPayload, IntegrationItem, IntegrationDetail, IntegrationDashboard, ListResponse, IntegrationProvider } from "@/types/integrations";
import type { WebhookEvent, Prisma } from "@prisma/client";

export async function getIntegrationsList(orgId: string, params: { page?: number; pageSize?: number; search?: string; provider?: string; status?: string }): Promise<ListResponse<IntegrationItem>> {
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const where: Record<string, unknown> = { organizationId: orgId };
  if (params.search) where.name = { contains: params.search };
  if (params.provider) where.provider = params.provider;
  if (params.status) where.status = params.status;

  const [data, total] = await Promise.all([
    prisma.integration.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { updatedAt: "desc" },
      include: { createdBy: { select: { name: true } }, _count: { select: { logs: true } } },
    }),
    prisma.integration.count({ where }),
  ]);

  return {
    data: data.map((i) => ({
      id: i.id, organizationId: i.organizationId, name: i.name, provider: i.provider as IntegrationProvider,
      type: i.type as any, status: i.status as any, description: i.description, webhookUrl: i.webhookUrl,
      lastSyncAt: i.lastSyncAt?.toISOString() ?? null, createdById: i.createdById,
      createdByName: (i.createdBy as { name: string | null })?.name ?? null,
      createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(),
    })),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getIntegrationDashboard(orgId: string): Promise<IntegrationDashboard> {
  const all = await prisma.integration.findMany({ where: { organizationId: orgId } });
  const byTypeMap = new Map<string, number>();
  all.forEach((i) => byTypeMap.set(i.type, (byTypeMap.get(i.type) || 0) + 1));

  const recent = await prisma.integration.findMany({
    where: { organizationId: orgId, status: "CONNECTED" }, orderBy: { lastSyncAt: "desc" }, take: 5,
    include: { createdBy: { select: { name: true } } },
  });

  return {
    total: all.length, connected: all.filter((i) => i.status === "CONNECTED").length,
    error: all.filter((i) => i.status === "ERROR").length, pending: all.filter((i) => i.status === "PENDING").length,
    byType: Array.from(byTypeMap.entries()).map(([type, count]) => ({ type: type as any, count })),
    recentSyncs: recent.map((i) => ({
      id: i.id, organizationId: i.organizationId, name: i.name, provider: i.provider as IntegrationProvider,
      type: i.type as any, status: i.status as any, description: i.description, webhookUrl: i.webhookUrl,
      lastSyncAt: i.lastSyncAt?.toISOString() ?? null, createdById: i.createdById,
      createdByName: (i.createdBy as { name: string | null })?.name ?? null,
      createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(),
    })),
  };
}

export async function getIntegrationById(id: string, orgId: string): Promise<IntegrationDetail | null> {
  const integration = await prisma.integration.findFirst({
    where: { id, organizationId: orgId },
    include: { createdBy: { select: { name: true } }, logs: { orderBy: { createdAt: "desc" }, take: 50 }, webhooks: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!integration) return null;
  return {
    id: integration.id, organizationId: integration.organizationId, name: integration.name,
    provider: integration.provider as IntegrationProvider, type: integration.type as any,
    status: integration.status as any, description: integration.description,
    configuration: integration.configuration as Record<string, unknown> | null,
    webhookUrl: integration.webhookUrl, lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
    createdById: integration.createdById, createdByName: (integration.createdBy as { name: string | null })?.name ?? null,
    createdAt: integration.createdAt.toISOString(), updatedAt: integration.updatedAt.toISOString(),
    logs: integration.logs.map((l) => ({
      id: l.id, integrationId: l.integrationId, action: l.action, status: l.status,
      message: l.message, duration: l.duration, metadata: l.metadata as Record<string, unknown> | null,
      createdAt: l.createdAt.toISOString(),
    })),
    webhooks: integration.webhooks.map((w) => ({
      id: w.id, integrationId: w.integrationId, event: w.event as WebhookEvent,
      payload: w.payload as Record<string, unknown> | null, processed: w.processed,
      processedAt: w.processedAt?.toISOString() ?? null, createdAt: w.createdAt.toISOString(),
    })),
  };
}

export async function createIntegration(orgId: string, userId: string, payload: CreateIntegrationPayload): Promise<IntegrationDetail> {
  const parsed = createIntegrationSchema.parse(payload);
  const provider = getProviderForIntegration(parsed.provider);
  const validation = await provider.validate(parsed.configuration || {});
  if (!validation.valid) throw new Error(validation.error);

  const integration = await prisma.integration.create({
    data: {
      organizationId: orgId, name: parsed.name, provider: parsed.provider,
      type: parsed.type, description: parsed.description ?? null,
      configuration: (parsed.configuration ?? {}) as Prisma.JsonObject, createdById: userId,
    },
  });

  await prisma.integrationLog.create({
    data: { integrationId: integration.id, action: "CREATED", status: "PENDING", message: "Integration created" },
  });

  return getIntegrationById(integration.id, orgId) as Promise<IntegrationDetail>;
}

export async function updateIntegration(id: string, orgId: string, payload: UpdateIntegrationPayload): Promise<IntegrationDetail | null> {
  const parsed = updateIntegrationSchema.parse(payload);
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return null;

  const updated = await prisma.integration.update({
    where: { id }, data: { ...parsed, configuration: (parsed.configuration ?? undefined) as Prisma.JsonObject | undefined },
  });

  await prisma.integrationLog.create({
    data: { integrationId: id, action: "UPDATED", status: updated.status, message: "Integration updated" },
  });

  return getIntegrationById(id, orgId);
}

export async function connectIntegration(id: string, orgId: string, _userId: string): Promise<IntegrationDetail | null> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return null;
  const config = integration.configuration as Record<string, unknown> || {};
  const provider = getProviderForIntegration(integration.provider as IntegrationProvider);
  const result = await provider.connect(config);

  const status = result.success ? "CONNECTED" : "ERROR";
  await prisma.integration.update({ where: { id }, data: { status } });
  await prisma.integrationLog.create({
    data: { integrationId: id, action: "CONNECT", status, message: result.error || "Connected successfully" },
  });

  return getIntegrationById(id, orgId);
}

export async function disconnectIntegration(id: string, orgId: string, _userId: string): Promise<IntegrationDetail | null> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return null;
  const config = integration.configuration as Record<string, unknown> || {};
  const provider = getProviderForIntegration(integration.provider as IntegrationProvider);
  await provider.disconnect(config);

  await prisma.integration.update({ where: { id }, data: { status: "DISCONNECTED" } });
  await prisma.integrationLog.create({
    data: { integrationId: id, action: "DISCONNECT", status: "DISCONNECTED", message: "Disconnected" },
  });
  return getIntegrationById(id, orgId);
}

export async function syncIntegration(id: string, orgId: string, _userId: string): Promise<IntegrationDetail | null> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return null;
  const config = integration.configuration as Record<string, unknown> || {};
  const provider = getProviderForIntegration(integration.provider as IntegrationProvider);

  const startTime = Date.now();
  const result = await provider.sync(config);
  const duration = Date.now() - startTime;

  const status = result.success ? "CONNECTED" : "ERROR";
  await prisma.integration.update({ where: { id }, data: { status, lastSyncAt: new Date() } });
  await prisma.integrationLog.create({
    data: { integrationId: id, action: "SYNC", status, message: result.error || "Sync completed", duration, metadata: (result.data ?? {}) as Prisma.JsonObject },
  });

  return getIntegrationById(id, orgId);
}

export async function deleteIntegration(id: string, orgId: string, _userId: string): Promise<boolean> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return false;
  await prisma.integration.delete({ where: { id } });
  return true;
}

export async function createWebhook(id: string, orgId: string, event: WebhookEvent, payload: Record<string, unknown>): Promise<boolean> {
  const integration = await prisma.integration.findFirst({ where: { id, organizationId: orgId } });
  if (!integration) return false;
  await prisma.integrationWebhook.create({
    data: { integrationId: id, event, payload: payload as Prisma.JsonObject },
  });
  return true;
}
