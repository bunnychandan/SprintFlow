export interface DeliverParams {
  recipientId: string;
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
  deliver(params: DeliverParams): Promise<void>;
  name: string;
}
