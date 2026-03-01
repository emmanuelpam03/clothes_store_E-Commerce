"use server";

import { auth, signOut } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
// import { rateLimit } from "@/lib/rate-limit";
import { setPasswordSchema } from "@/lib/validators/set-password.schema";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// Simple in-memory rate limiter for password verification attempts
const passwordAttempts = new Map<
  string,
  { count: number; resetAt: number; lockedUntil?: number }
>();

// Cleanup expired entries to prevent memory leaks
function cleanupExpiredAttempts() {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  for (const [key, record] of passwordAttempts.entries()) {
    // Remove if both resetAt and lockedUntil (if exists) are expired
    const resetExpired = record.resetAt < now;
    const lockExpired = !record.lockedUntil || record.lockedUntil < now;

    if (resetExpired && lockExpired) {
      entriesToDelete.push(key);
    }
  }

  entriesToDelete.forEach((key) => passwordAttempts.delete(key));
}

// Guard against unbounded growth
const MAX_ENTRIES = 10000;
function guardMapGrowth() {
  if (passwordAttempts.size > MAX_ENTRIES) {
    // Remove oldest 20% of entries when limit exceeded
    const entriesToRemove = Math.floor(MAX_ENTRIES * 0.2);
    const keys = Array.from(passwordAttempts.keys());
    for (let i = 0; i < entriesToRemove && i < keys.length; i++) {
      passwordAttempts.delete(keys[i]);
    }
  }
}

function checkPasswordAttemptLimit(userId: string): {
  allowed: boolean;
  error?: string;
} {
  // Periodically clean up expired entries (10% chance on each check)
  if (Math.random() < 0.1) {
    cleanupExpiredAttempts();
  }

  const now = Date.now();
  const key = `password-verify:${userId}`;
  const record = passwordAttempts.get(key);

  // Check if locked
  if (record?.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `Too many failed attempts. Please try again in ${minutesLeft} minute(s).`,
    };
  }

  // Reset if window expired
  if (!record || record.resetAt < now) {
    guardMapGrowth(); // Check size before adding
    passwordAttempts.set(key, {
      count: 1,
      resetAt: now + 10 * 60 * 1000, // 10 minutes
    });
    return { allowed: true };
  }

  // Check limit (5 attempts)
  if (record.count >= 5) {
    // Lock for 15 minutes
    passwordAttempts.set(key, {
      ...record,
      lockedUntil: now + 15 * 60 * 1000,
    });
    return {
      allowed: false,
      error: "Too many failed attempts. Account locked for 15 minutes.",
    };
  }

  // Increment attempt
  passwordAttempts.set(key, {
    ...record,
    count: record.count + 1,
  });

  return { allowed: true };
}

function clearPasswordAttempts(userId: string) {
  const key = `password-verify:${userId}`;
  passwordAttempts.delete(key);
}

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
 * DEACTIVATE ACCOUNT (SOFT DELETE WITH 90-DAY GRACE PERIOD)
 * User can reactivate within 90 days by logging in again
 * After 90 days, account is permanently deleted by cleanup script
 */
export async function deactivateAccountAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Soft delete: mark account as inactive
  // User can reactivate within 90 days
  // Cleanup script will permanently delete after 90 days
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      active: false,
      deletedAt: new Date(),
    },
  });

  // Sign the user out
  await signOut({ redirectTo: "/login?deactivated=true" });
}

/**
 * PERMANENTLY DELETE ACCOUNT (IMMEDIATE GDPR-COMPLIANT DELETION)
 * Immediately anonymizes user's personal data - cannot be undone
 */
export async function deleteAccountPermanently() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Use transaction to ensure all operations succeed together
  await prisma.$transaction(async (tx) => {
    // Fetch current user to check if deletedAt already exists
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });

    // Preserve existing deletedAt (if account was deactivated earlier)
    // or set new timestamp (if this is first deletion action)
    const deletedAtValue = currentUser?.deletedAt || new Date();

    // 1. Anonymize user's personal data
    const anonymizedEmail = `deleted_${userId}@deleted.local`;
    await tx.user.update({
      where: { id: userId },
      data: {
        active: false,
        deletedAt: deletedAtValue,
        email: anonymizedEmail,
        name: "Deleted User",
        image: null,
        password: null, // Remove password
        emailVerified: null,
      },
    });

    // 2. Anonymize personal data in all orders (preserve order records)
    await tx.order.updateMany({
      where: { userId },
      data: {
        email: anonymizedEmail,
        phone: "DELETED",
        firstName: "Deleted",
        lastName: "User",
        address: "DELETED",
        city: "DELETED",
        zipCode: "00000",
        country: "DELETED",
      },
    });

    // 3. Delete cart (will cascade to cart items)
    await tx.cart.deleteMany({
      where: { userId },
    });

    // 4. Delete favorites
    await tx.favorite.deleteMany({
      where: { userId },
    });

    // 5. Delete sessions
    await tx.session.deleteMany({
      where: { userId },
    });

    // 6. Delete OAuth accounts (Google, etc.)
    await tx.account.deleteMany({
      where: { userId },
    });

    // 7. Delete email verification tokens
    await tx.emailVerificationToken.deleteMany({
      where: { userId },
    });
  });

  // Sign the user out
  await signOut({ redirectTo: "/login?deleted=true" });
}

/**
 * REACTIVATE ACCOUNT (RESTORE DEACTIVATED ACCOUNT)
 * Can only be used within 90 days of deactivation
 */
export async function reactivateAccountAction(email: string, password: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return { success: false, error: "Invalid credentials" };
  }

  // Check if account is deactivated
  if (user.active) {
    return { success: false, error: "Account is already active" };
  }

  // Check if account is within 90-day grace period
  if (user.deletedAt) {
    const daysSinceDeactivation = Math.floor(
      (Date.now() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceDeactivation > 90) {
      return {
        success: false,
        error:
          "Account deactivation period expired. Account will be permanently deleted.",
      };
    }
  }

  // Rate limiting: Check password verification attempts
  const rateLimitCheck = checkPasswordAttemptLimit(user.id);
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error };
  }

  // Verify password
  const bcrypt = await import("bcryptjs");
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    // Failed attempt - rate limiter already incremented
    return { success: false, error: "Invalid credentials" };
  }

  // Success - clear rate limit attempts
  clearPasswordAttempts(user.id);

  // Reactivate account
  await prisma.user.update({
    where: { id: user.id },
    data: {
      active: true,
      deletedAt: null,
    },
  });

  return { success: true };
}

// ======================================================
// ADMIN ACCOUNT MANAGEMENT ACTIONS
// ======================================================

/**
 * ADMIN: DEACTIVATE USER ACCOUNT
 * Soft delete with 90-day grace period
 */
export async function adminDeactivateUserAction(userId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (adminUser?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Prevent admin from deactivating themselves
  if (userId === session.user.id) {
    throw new Error("Cannot deactivate your own account");
  }

  // Deactivate user account
  await prisma.user.update({
    where: { id: userId },
    data: {
      active: false,
      deletedAt: new Date(),
    },
  });

  // Delete user's sessions (force logout)
  await prisma.session.deleteMany({
    where: { userId },
  });

  return { success: true };
}

/**
 * ADMIN: PERMANENTLY DELETE USER ACCOUNT
 * Immediately anonymizes user's personal data - cannot be undone
 */
export async function adminDeleteUserPermanentlyAction(userId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (adminUser?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Prevent admin from deleting themselves
  if (userId === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  // Use transaction to ensure all operations succeed together
  await prisma.$transaction(async (tx) => {
    // Fetch current user to check if deletedAt already exists
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { deletedAt: true },
    });

    // Preserve existing deletedAt (if account was deactivated earlier)
    // or set new timestamp (if this is first deletion action)
    const deletedAtValue = currentUser?.deletedAt || new Date();

    // 1. Anonymize user's personal data
    const anonymizedEmail = `deleted_${userId}@deleted.local`;
    await tx.user.update({
      where: { id: userId },
      data: {
        active: false,
        deletedAt: deletedAtValue,
        email: anonymizedEmail,
        name: "Deleted User",
        image: null,
        password: null,
        emailVerified: null,
      },
    });

    // 2. Anonymize personal data in all orders
    await tx.order.updateMany({
      where: { userId },
      data: {
        email: anonymizedEmail,
        phone: "DELETED",
        firstName: "Deleted",
        lastName: "User",
        address: "DELETED",
        city: "DELETED",
        zipCode: "00000",
        country: "DELETED",
      },
    });

    // 3. Delete cart
    await tx.cart.deleteMany({
      where: { userId },
    });

    // 4. Delete favorites
    await tx.favorite.deleteMany({
      where: { userId },
    });

    // 5. Delete sessions
    await tx.session.deleteMany({
      where: { userId },
    });

    // 6. Delete OAuth accounts
    await tx.account.deleteMany({
      where: { userId },
    });

    // 7. Delete email verification tokens
    await tx.emailVerificationToken.deleteMany({
      where: { userId },
    });
  });

  return { success: true };
}

/**
 * ADMIN: REACTIVATE USER ACCOUNT
 * Restore deactivated account (must be within 90-day grace period)
 */
export async function adminReactivateUserAction(userId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is admin
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (adminUser?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if account is already active
  if (user.active) {
    return { success: false, error: "Account is already active" };
  }

  // Check if account was permanently deleted (anonymized)
  if (user.email && user.email.startsWith("deleted_")) {
    return {
      success: false,
      error: "Cannot reactivate permanently deleted account",
    };
  }

  // Check if account is within 90-day grace period
  if (user.deletedAt) {
    const daysSinceDeactivation = Math.floor(
      (Date.now() - user.deletedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceDeactivation > 90) {
      return {
        success: false,
        error: "Account deactivation period expired",
      };
    }
  }

  // Reactivate account
  await prisma.user.update({
    where: { id: userId },
    data: {
      active: true,
      deletedAt: null,
    },
  });

  return { success: true };
}

/**
 * CHANGE PASSWORD ON FIRST LOGIN
 * For users created by admin with temporary passwords
 */
export async function changePasswordFirstLogin(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      password: true,
      requirePasswordChange: true,
      passwordChangeDeadline: true,
    },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Check if user is required to change password
  if (!user.requirePasswordChange) {
    return { success: false, error: "Password change not required" };
  }

  // Check if temporary password has expired
  if (user.passwordChangeDeadline && user.passwordChangeDeadline < new Date()) {
    return {
      success: false,
      error: "Temporary password has expired. Please contact an administrator.",
    };
  }

  // Rate limiting: Check password verification attempts
  const rateLimitCheck = checkPasswordAttemptLimit(user.id);
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error };
  }

  // Verify current password
  if (!user.password) {
    return { success: false, error: "No password set for this account" };
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    // Failed attempt - rate limiter already incremented
    return { success: false, error: "Current password is incorrect" };
  }

  // Success - clear rate limit attempts
  clearPasswordAttempts(user.id);

  // Validate new password
  const validation = setPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: newPassword,
  });
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      error: errors.password?.[0] || "Invalid password",
    };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear password change requirement
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      requirePasswordChange: false,
      passwordChangeDeadline: null,
    },
  });

  return { success: true };
}
