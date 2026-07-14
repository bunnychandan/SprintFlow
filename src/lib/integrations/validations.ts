import { z } from "zod";

export const providerSchema = z.enum(["GITHUB", "GITLAB", "BITBUCKET", "AZURE_DEVOPS", "SLACK", "MICROSOFT_TEAMS", "GOOGLE_CALENDAR", "OUTLOOK", "ZOOM", "GOOGLE_MEET", "JENKINS", "ARGOCD", "JIRA", "LINEAR", "NOTION", "FIGMA", "CUSTOM"]);
export const integrationTypeSchema = z.enum(["SOURCE_CONTROL", "COMMUNICATION", "CALENDAR", "VIDEO", "CI_CD", "PROJECT_MANAGEMENT", "DESIGN", "DOCUMENTATION", "CUSTOM"]);
export const integrationStatusSchema = z.enum(["CONNECTED", "DISCONNECTED", "ERROR", "PENDING"]);
export const webhookEventSchema = z.enum(["PUSH", "PULL_REQUEST", "ISSUE", "PIPELINE", "DEPLOYMENT", "TASK", "SPRINT", "PROJECT", "RELEASE", "COMMENT", "CUSTOM"]);

export const createIntegrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  provider: providerSchema,
  type: integrationTypeSchema,
  description: z.string().optional().nullable(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});

export const updateIntegrationSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  configuration: z.record(z.string(), z.unknown()).optional(),
});
