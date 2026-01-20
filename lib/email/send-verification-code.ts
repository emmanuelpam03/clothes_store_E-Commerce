import { sendEmail } from "./send-email";

export async function sendVerificationCodeEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: sans-serif">
        <h2>Email verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 6px">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}
