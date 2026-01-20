import { sendVerificationCodeEmail } from "./email/send-verification-code";

export async function sendVerificationEmail(email: string, code: string) {
  await sendVerificationCodeEmail(email, code);
}
