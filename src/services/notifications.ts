import type {
  NotificationItem,
  NotificationListResponse,
  UnreadCountResponse,
  NotificationPreferencesData,
} from "@/types/admin";

export async function getNotifications(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  priority?: string;
  isRead?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<NotificationListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params?.type) sp.set("type", params.type);
  if (params?.priority) sp.set("priority", params.priority);
  if (params?.isRead) sp.set("isRead", params.isRead);
  if (params?.search) sp.set("search", params.search);
  if (params?.sortBy) sp.set("sortBy", params.sortBy);
  if (params?.sortOrder) sp.set("sortOrder", params.sortOrder);
  const qs = sp.toString();
  const res = await fetch(`/api/notifications${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function getNotification(id: string): Promise<NotificationItem> {
  const res = await fetch(`/api/notifications/${id}`);
  if (!res.ok) throw new Error("Failed to fetch notification");
  return res.json();
}

export async function markAsRead(id: string): Promise<NotificationItem> {
  const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}

export async function markAllAsRead(): Promise<{ count: number }> {
  const res = await fetch("/api/notifications/read-all", { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}

export async function deleteNotification(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete notification");
}

export async function bulkUpdate(
  ids: string[],
  action: "read" | "delete"
): Promise<{ count: number }> {
  const res = await fetch("/api/notifications/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action }),
  });
  if (!res.ok) throw new Error("Failed to bulk update notifications");
  return res.json();
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const res = await fetch("/api/notifications/unread-count");
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
}

export async function getPreferences(): Promise<NotificationPreferencesData> {
  const res = await fetch("/api/notifications/preferences");
  if (!res.ok) throw new Error("Failed to fetch notification preferences");
  return res.json();
}

export async function updatePreferences(
  data: Partial<NotificationPreferencesData>
): Promise<NotificationPreferencesData> {
  const res = await fetch("/api/notifications/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update notification preferences");
  return res.json();
}
