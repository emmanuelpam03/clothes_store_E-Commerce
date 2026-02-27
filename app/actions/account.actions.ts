"use server";

import { auth, signOut } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
// import { rateLimit } from "@/lib/rate-limit";
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
    (account) => account.provider === "google",
  );

  if (!googleAccount) {
    return;
  }

  const hasPassword = Boolean(user.password);
  const authMethodCount = user.accounts.length + (hasPassword ? 1 : 0);

  if (!hasPassword && authMethodCount <= 1) {
    throw new Error(
      "You must set a password before unlinking your Google account.",
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
  formData: FormData,
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

export async function verifyEmailCodeAction(code: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // await rateLimit({
  //   key: `verify:${userId}`,
  //   limit: 10,
  //   windowMs: 10 * 60 * 1000, // 10 minutes
  // });

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

      throw new Error("Too many attempts. Verification locked for 15 mins.");
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
    data: {
      emailVerified: new Date(),
      active: true, // Activate account upon email verification (for both new and restored accounts)
    },
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
  const email = session.user.email;

  // await rateLimit({
  //   key: `resend:${userId}`,
  //   limit: 3,
  //   windowMs: 60 * 60 * 1000, // 1 hour
  // });

  const existing = await prisma.emailVerificationToken.findUnique({
    where: { userId },
  });

  // ⏱ Simple cooldown: 60 seconds
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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      createdAt: new Date(),
    },
    create: {
      userId,
      code,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // ✅ SEND REAL EMAIL
  await sendVerificationEmail(email, code);
}

/**
 * DELETE ACCOUNT ACTION (SOFT DELETE)
 * Deactivates the user's account and signs them out
 */
export async function deleteAccountAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Soft delete: mark account as inactive and record deletion timestamp
  // Account will remain in database for 90 days before permanent deletion
  // User can reactivate within 90 days by registering with same email
  // Permanent deletion is handled by scripts/cleanup-deleted-accounts.ts
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      active: false,
      deletedAt: new Date(),
    },
  });

  // Sign the user out
  await signOut({ redirectTo: "/login?deleted=true" });
}
