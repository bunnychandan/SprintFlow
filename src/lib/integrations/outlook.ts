import type { IntegrationProviderInterface } from "./provider";

export class OutlookProvider implements IntegrationProviderInterface {
  readonly name = "Outlook Calendar";
  readonly provider = "OUTLOOK";
  readonly type = "CALENDAR";
  readonly description = "Sync events with Outlook Calendar.";

  async validate(config: Record<string, unknown>) {
    if (!config.clientId && !config.token) return { valid: false, error: "Client ID or token is required" };
    return { valid: true };
  }

  async connect(config: Record<string, unknown>) {
    const validation = await this.validate(config);
    if (!validation.valid) return { success: false, error: validation.error };
    return { success: true, data: { connected: true } };
  }

  async disconnect() { return { success: true }; }

  async sync() { return { success: true, data: { synced: true, events: [] } }; }

  getConfigurationSchema() {
    return { clientId: { type: "text", label: "Client ID" }, token: { type: "password", label: "Access Token" }, tenantId: { type: "text", label: "Tenant ID" } };
  }
}
