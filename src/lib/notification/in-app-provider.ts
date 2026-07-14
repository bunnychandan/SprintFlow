import type { NotificationProvider, DeliverParams } from "./types";

export class InAppNotificationProvider implements NotificationProvider {
  name = "in-app";

  async deliver(_params: DeliverParams): Promise<void> {
    // Notifications are written to DB by the service layer.
    // This provider is a pass-through for the in-app channel.
    // Future: add push via SSE or WebSocket here.
  }
}
