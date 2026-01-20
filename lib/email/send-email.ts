import { transporter } from "./transporter";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  // DEV: log instead of sending
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 DEV EMAIL");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html);
    return;
  }

  // PROD: real email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });
}
