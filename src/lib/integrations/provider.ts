export interface IntegrationProviderInterface {
  readonly name: string;
  readonly provider: string;
  readonly type: string;
  readonly description: string;
  validate(config: Record<string, unknown>): Promise<{ valid: boolean; error?: string }>;
  connect(config: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>;
  disconnect(config: Record<string, unknown>): Promise<{ success: boolean }>;
  sync(config: Record<string, unknown>): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>;
  getConfigurationSchema(): Record<string, { type: string; label: string; required?: boolean; placeholder?: string }>;
}
