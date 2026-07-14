export type PollingCallback = (notifications: Array<Record<string, unknown>>) => void;

export interface RealtimeSubscriber {
  unsubscribe(): void;
}

export function subscribeNotifications(
  unreadCount: number,
  callback: PollingCallback,
  intervalMs = 30000
): RealtimeSubscriber {
  let lastCount = unreadCount;
  const id = setInterval(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) return;
      const data = await res.json();
      if (data.count !== lastCount) {
        lastCount = data.count;
        const notifRes = await fetch("/api/notifications?pageSize=10");
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          callback(notifData.notifications);
        }
      }
    } catch {
      // Silently retry on next interval
    }
  }, intervalMs);

  return {
    unsubscribe: () => clearInterval(id),
  };
}
