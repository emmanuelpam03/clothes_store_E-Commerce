"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { setPasswordSchema } from "@/lib/validators/set-password.schema";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

type SetPasswordState = {
  error: string | null;
  success: boolean;
};

/**
 * CHECK IF GOOGLE CAN BE LINKED
 * Blocks ONLY when Google email belongs to another user
 */
export async function canLinkGoogleAction() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { ok: false };
  }

  // Find any existing Google account with the same email
  const existingAccount = await prisma.account.findFirst({
    where: {
      provider: "google",
      user: {
        email: session.user.email,
      },
    },
    select: {
      userId: true,
    },
  });

  // If Google account exists but belongs to another user → block
  if (existingAccount && existingAccount.userId !== session.user.id) {
    return {
      ok: false,
      reason: "EMAIL_ALREADY_IN_USE",
    };
  }

  // Otherwise linking is allowed
  return { ok: true };
}

/**
 * UNLINK GOOGLE ACCOUNT
 */
export async function unlinkGoogleAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true },
  });

  if (!user) {
    redirect("/login");
  }

  const googleAccount = user.accounts.find(
    (account) => account.provider === "google"
  );

  if (!googleAccount) {
    return;
  }

  const hasPassword = Boolean(user.password);
  const authMethodCount = user.accounts.length + (hasPassword ? 1 : 0);

  if (!hasPassword && authMethodCount <= 1) {
    throw new Error(
      "You must set a password before unlinking your Google account."
    );
  }

  await prisma.account.delete({
    where: { id: googleAccount.id },
  });

  redirect("/profile");
}

/**
 * SET PASSWORD ACTION
 */
export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
      success: false,
    };
  }

  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return {
      error:
        errors.password?.[0] || errors.confirmPassword?.[0] || "Invalid input",
      success: false,
    };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return {
    error: null,
    success: true,
  };
}

/** VERIFY EMAIL CODE ACTION
 */
// export async function verifyEmailCodeAction(code: string) {
//   const session = await auth();

//   if (!session?.user?.id) {
//     return { ok: false, error: "Unauthorized" };
//   }

//   const record = await prisma.emailVerificationToken.findFirst({
//     where: {
//       userId: session.user.id,
//       code,
//     },
//   });

//   if (!record) {
//     return { ok: false, error: "Invalid or expired code" };
//   }

//   if (record.expiresAt < new Date()) {
//     return { ok: false, error: "Invalid or expired code" };
//   }

//   if (record.lockedUntil && record.lockedUntil > new Date()) {
//     return {
//       ok: false,
//       error: "Too many attempts. Try again later.",
//     };
//   }

//   // ✅ VERIFY ONLY HERE
//   await prisma.user.update({
//     where: { id: session.user.id },
//     data: { emailVerified: new Date() },
//   });

//   await prisma.emailVerificationToken.delete({
//     where: { id: record.id },
//   });

//   return { ok: true };
// }

export async function verifyEmailCodeAction(code: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const record = await prisma.emailVerificationToken.findUnique({
    where: { userId },
  });

  // ❌ No record or expired
  if (!record || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired code");
  }

  // 🔒 Locked
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    throw new Error("Too many attempts. Try again later.");
  }

  // ❌ Wrong code
  if (record.code !== code) {
    const attempts = record.attempts + 1;

    // Lock after 5 attempts
    if (attempts >= 5) {
      await prisma.emailVerificationToken.update({
        where: { userId },
        data: {
          attempts,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 min
        },
      });

      throw new Error("Too many attempts. Verification locked.");
    }

    // Normal failed attempt
    await prisma.emailVerificationToken.update({
      where: { userId },
      data: { attempts },
    });

    throw new Error("Invalid verification code");
  }

  // ✅ SUCCESS
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  await prisma.emailVerificationToken.delete({
    where: { userId },
  });
}

/** RESEND VERIFICATION CODE ACTION
 */

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function resendVerificationCodeAction() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existing = await prisma.emailVerificationToken.findUnique({
    where: { userId },
  });

  // Optional: simple cooldown (60s)
  if (existing && existing.createdAt > new Date(Date.now() - 60_000)) {
    throw new Error("Please wait before requesting another code.");
  }

  const code = generate6DigitCode();

  await prisma.emailVerificationToken.upsert({
    where: { userId },
    update: {
      code,
      attempts: 0,
      lockedUntil: null,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
    create: {
      userId,
      code,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // TEMP (until Nodemailer)
  console.log(`📧 Verification code for ${session.user.email}: ${code}`);
}
