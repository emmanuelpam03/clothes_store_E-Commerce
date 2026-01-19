"use server";

import prisma from "@/lib/prisma";

/**
 * Generate a 6-digit numeric email verification code (OTP)
 * - One active code per user
 * - Expires after 10 minutes
 */
export async function createEmailVerificationToken(userId: string) {
  // Generate 6-digit numeric code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Clean up any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  // Store new OTP
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  });

  return code;
}
