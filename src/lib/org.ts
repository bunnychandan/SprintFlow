import { prisma } from "@/lib/prisma";

const DEFAULT_FEATURE_FLAGS = [
  { key: "projects", label: "Projects", enabled: true },
  { key: "sprints", label: "Sprints", enabled: true },
  { key: "reports", label: "Reports", enabled: true },
  { key: "notifications", label: "Notifications", enabled: true },
  { key: "project-intelligence", label: "Project Intelligence", enabled: false },
  { key: "ai-assistant", label: "AI Assistant", enabled: false },
];

export async function getOrCreateOrganization() {
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "My Organization" },
    });
    await prisma.organizationSetting.create({
      data: { organizationId: org.id },
    });
    await prisma.brandingSetting.create({
      data: { organizationId: org.id },
    });
    for (const flag of DEFAULT_FEATURE_FLAGS) {
      await prisma.featureFlag.create({
        data: { organizationId: org.id, ...flag },
      });
    }
    org = await prisma.organization.findFirst({ where: { id: org.id } });
  }
  return org!;
}

export async function getFullOrganization() {
  const org = await getOrCreateOrganization();
  const [settings, branding, featureFlags, holidays] = await Promise.all([
    prisma.organizationSetting.findUnique({ where: { organizationId: org.id } }),
    prisma.brandingSetting.findUnique({ where: { organizationId: org.id } }),
    prisma.featureFlag.findMany({ where: { organizationId: org.id }, orderBy: { key: "asc" } }),
    prisma.holiday.findMany({ where: { organizationId: org.id }, orderBy: { date: "asc" } }),
  ]);
  return { ...org, settings, branding, featureFlags, holidays };
}
