// lib/email/send-email.ts
import { resend } from "./resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("RESEND RESULT:", {
      id: (result as { data?: { id?: string } })?.data?.id,
      error: (result as { error?: unknown })?.error,
    });
  }
}
