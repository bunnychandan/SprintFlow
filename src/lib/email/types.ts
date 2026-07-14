export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailProvider {
  send(params: SendEmailParams): Promise<void>;
  name: string;
}
