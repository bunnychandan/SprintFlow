import { getEmailProvider } from "./index";

export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  type: string;
  token: string;
  expiresAt: Date;
}): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const acceptUrl = `${baseUrl}/api/invitations/${params.token}`;

  const subject = `You've been invited to SprintFlow as ${params.type}`;
  const text = [
    `Hello,`,
    ``,
    `${params.inviterName} has invited you to join SprintFlow as ${params.type}.`,
    ``,
    `To accept this invitation, use the following link:`,
    `${acceptUrl}`,
    ``,
    `This invitation will expire on ${params.expiresAt.toLocaleDateString()}.`,
    ``,
    `If you did not expect this invitation, you can safely ignore this email.`,
  ].join("\n");

  const html = [
    `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;">`,
    `<h2>You're invited to SprintFlow</h2>`,
    `<p><strong>${params.inviterName}</strong> has invited you to join as <strong>${params.type}</strong>.</p>`,
    `<p>Click the button below to accept:</p>`,
    `<a href="${acceptUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Accept Invitation</a>`,
    `<p style="margin-top:24px;color:#666;font-size:12px;">This invitation expires on ${params.expiresAt.toLocaleDateString()}.</p>`,
    `</body></html>`,
  ].join("\n");

  const provider = getEmailProvider();
  await provider.send({ to: params.to, subject, text, html });
}
