import type { EmailProvider, SendEmailParams } from "./types";

export class LoggerEmailProvider implements EmailProvider {
  name = "logger";

  async send(params: SendEmailParams): Promise<void> {
    console.log("─── Email Log ───────────────────────────────────────");
    console.log(`To:      ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Body:`);
    console.log(params.text);
    if (params.html) {
      console.log(`(HTML version omitted — ${params.html.length} chars)`);
    }
    console.log("──────────────────────────────────────────────────────");
  }
}
