import type { IntegrationProviderInterface } from "./provider";

export class GoogleCalendarProvider implements IntegrationProviderInterface {
  readonly name = "Google Calendar";
  readonly provider = "GOOGLE_CALENDAR";
  readonly type = "CALENDAR";
  readonly description = "Sync events with Google Calendar.";

  async validate(config: Record<string, unknown>) {
    if (!config.clientId && !config.apiKey) return { valid: false, error: "Client ID or API key is required" };
    return { valid: true };
  }

  async connect(config: Record<string, unknown>) {
    const validation = await this.validate(config);
    if (!validation.valid) return { success: false, error: validation.error };
    return { success: true, data: { connected: true, calendarId: config.calendarId } };
  }

  async disconnect() { return { success: true }; }

  async sync() { return { success: true, data: { synced: true, events: [] } }; }

  getConfigurationSchema() {
    return { clientId: { type: "text", label: "Client ID" }, apiKey: { type: "password", label: "API Key" }, calendarId: { type: "text", label: "Calendar ID", placeholder: "primary" } };
  }
}
