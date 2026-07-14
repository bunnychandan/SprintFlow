import type { EmailProvider } from "./types";
import { LoggerEmailProvider } from "./logger-provider";

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!provider) {
    const driver = process.env.EMAIL_PROVIDER ?? "logger";

    switch (driver) {
      default:
        console.warn(`Email provider "${driver}" not implemented. Falling back to logger.`);
        provider = new LoggerEmailProvider();
        break;
    }
  }
  return provider;
}

export type { EmailProvider, SendEmailParams } from "./types";
