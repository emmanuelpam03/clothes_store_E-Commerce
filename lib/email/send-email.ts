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

  console.log("RESEND RESULT:", result);
}
