export async function getSettings() {
  const res = await fetch("/api/admin/settings");
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}
