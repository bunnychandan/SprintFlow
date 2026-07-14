import type { IntegrationProviderInterface } from "./provider";

export class MicrosoftTeamsProvider implements IntegrationProviderInterface {
  readonly name = "Microsoft Teams";
  readonly provider = "MICROSOFT_TEAMS";
  readonly type = "COMMUNICATION";
  readonly description = "Connect to Microsoft Teams for notifications.";

  async validate(config: Record<string, unknown>) {
    if (!config.webhookUrl) return { valid: false, error: "Webhook URL is required" };
    return { valid: true };
  }

  async connect(config: Record<string, unknown>) {
    const validation = await this.validate(config);
    if (!validation.valid) return { success: false, error: validation.error };
    return { success: true, data: { connected: true } };
  }

  async disconnect() { return { success: true }; }

  async sync() { return { success: true, data: { synced: true } }; }

  getConfigurationSchema() {
    return { webhookUrl: { type: "text", label: "Webhook URL", required: true } };
  }
}
