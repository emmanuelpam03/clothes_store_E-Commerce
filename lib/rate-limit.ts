import prisma from "@/lib/prisma";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  lockoutMs?: number; // Optional lockout duration after exceeding limit
};

type RateLimitResult = {
  allowed: boolean;
  error?: string;
};

/**
 * Database-backed rate limiter with optional lockout support
 * Works across serverless invocations and multiple instances
 * Includes automatic cleanup of expired records (5% chance per call)
 */
export async function rateLimit({
  key,
  limit,
  windowMs,
  lockoutMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  const now = new Date();

  // Automatic cleanup: 5% chance to remove expired records
  if (Math.random() < 0.05) {
    // Run cleanup in background (don't await)
    cleanupExpiredRateLimits().catch(() => {
      // Ignore cleanup errors to not affect rate limiting
    });
  }

  const record = await prisma.rateLimit.findUnique({
    where: { key },
  });

  // Check if locked
  if (record?.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil(
      (record.lockedUntil.getTime() - now.getTime()) / 60000,
    );
    return {
      allowed: false,
      error: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
    };
  }

  // First request or expired window
  if (!record || record.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: {
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
        lockedUntil: null, // Clear any previous lockout
      },
      create: {
        key,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });

    return { allowed: true };
  }

  // Over limit - apply lockout if configured
  if (record.count >= limit) {
    if (lockoutMs) {
      await prisma.rateLimit.update({
        where: { key },
        data: {
          lockedUntil: new Date(now.getTime() + lockoutMs),
        },
      });

      return {
        allowed: false,
        error: `Too many attempts. Locked for ${Math.ceil(lockoutMs / 60000)} minutes.`,
      };
    }

    return {
      allowed: false,
      error: "Too many requests. Please try again later.",
    };
  }

  // Increment
  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return { allowed: true };
}

/**
 * Clear rate limit for a specific key (e.g., after successful authentication)
 */
export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimit
    .delete({
      where: { key },
    })
    .catch(() => {
      // Ignore if key doesn't exist
    });
}

/**
 * Cleanup expired rate limit records
 * Called automatically by rateLimit() (5% probability) or manually via cron/script
 */
export async function cleanupExpiredRateLimits(): Promise<number> {
  const now = new Date();

  const result = await prisma.rateLimit.deleteMany({
    where: {
      resetAt: { lt: now },
      OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
    },
  });

  return result.count;
}
