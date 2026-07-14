export async function getOrganization() {
  const res = await fetch("/api/admin/organization");
  if (!res.ok) throw new Error("Failed to fetch organization");
  return res.json();
}

export async function updateOrganization(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/organization", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to update organization"); }
  return res.json();
}

export async function getOrgSettings() {
  const res = await fetch("/api/admin/organization/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updateOrgSettings(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/organization/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to update settings"); }
  return res.json();
}

export async function getOrgBranding() {
  const res = await fetch("/api/admin/organization/branding");
  if (!res.ok) throw new Error("Failed to fetch branding");
  return res.json();
}

export async function updateOrgBranding(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/organization/branding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to update branding"); }
  return res.json();
}

export async function getFeatureFlags() {
  const res = await fetch("/api/admin/organization/feature-flags");
  if (!res.ok) throw new Error("Failed to fetch feature flags");
  return res.json();
}

export async function updateFeatureFlags(flags: Array<{ key: string; enabled: boolean }>) {
  const res = await fetch("/api/admin/organization/feature-flags", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flags }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to update feature flags"); }
  return res.json();
}

export async function getHolidays() {
  const res = await fetch("/api/admin/organization/holidays");
  if (!res.ok) throw new Error("Failed to fetch holidays");
  return res.json();
}

export async function createHoliday(data: { name: string; date: string; type?: string; region?: string; recurring?: boolean }) {
  const res = await fetch("/api/admin/organization/holidays", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to create holiday"); }
  return res.json();
}

export async function deleteHoliday(id: string) {
  const res = await fetch(`/api/admin/organization/holidays/${id}`, { method: "DELETE" });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to delete holiday"); }
  return res.json();
}

export async function getOrgAnalytics() {
  const res = await fetch("/api/admin/organization/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
