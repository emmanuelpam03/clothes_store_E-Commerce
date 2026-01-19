export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  // TEMP: log instead of sending
  console.log("📧 Verify email:", verifyUrl);

  // Later:
  // - Resend
  // - Nodemailer
  // - Postmark
}

