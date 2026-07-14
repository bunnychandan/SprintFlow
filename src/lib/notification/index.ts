import type { NotificationProvider, DeliverParams } from "./types";
import { InAppNotificationProvider } from "./in-app-provider";

const providers = new Map<string, NotificationProvider>();
providers.set("in-app", new InAppNotificationProvider());

export function getNotificationProvider(channel: string): NotificationProvider {
  const provider = providers.get(channel);
  if (!provider) {
    console.warn(`Notification provider "${channel}" not implemented. Falling back to in-app.`);
    return providers.get("in-app")!;
  }
  return provider;
}

export async function deliverNotification(params: DeliverParams & { channel?: string }): Promise<void> {
  const channel = params.channel || "in-app";
  const provider = getNotificationProvider(channel);
  await provider.deliver(params);
}
