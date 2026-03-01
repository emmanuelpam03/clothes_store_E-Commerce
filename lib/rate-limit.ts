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
 * Uses atomic operations to prevent race conditions
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

  // Step 1: Try atomic increment (only if not locked, under limit, and within window)
  const atomicIncrement = await prisma.rateLimit.updateMany({
    where: {
      key,
      resetAt: { gt: now }, // Within window
      count: { lt: limit }, // Under limit
      OR: [
        { lockedUntil: null }, // Not locked
        { lockedUntil: { lte: now } }, // Lockout expired
      ],
    },
    data: {
      count: { increment: 1 },
    },
  });

  // Success: atomic increment worked
  if (atomicIncrement.count > 0) {
    return { allowed: true };
  }

  // Step 2: Atomic increment failed - fetch record to determine why
  const record = await prisma.rateLimit.findUnique({
    where: { key },
  });

  // Case 1: Record doesn't exist - create new record
  if (!record) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: {
        count: { increment: 1 },
      },
      create: {
        key,
        count: 1,
        resetAt: new Date(now.getTime() + windowMs),
      },
    });
    return { allowed: true };
  }
  // Case 2: Currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const minutesLeft = Math.ceil(
      (record.lockedUntil.getTime() - now.getTime()) / 60000,
    );
    return {
      allowed: false,
      error: `Too many attempts. Please try again in ${minutesLeft} minute(s).`,
    };
  }

  // Case 3: Window expired - reset with atomic upsert
  if (record.resetAt < now) {
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

  // Case 4: Over limit - apply lockout if configured
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

  // Case 5: Race condition - another request just incremented or locked
  // Re-attempt atomic increment once
  const retryIncrement = await prisma.rateLimit.updateMany({
    where: {
      key,
      resetAt: { gt: now },
      count: { lt: limit },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
    data: {
      count: { increment: 1 },
    },
  });

  if (retryIncrement.count > 0) {
    return { allowed: true };
  }

  // Deny by default if retry also failed
  return {
    allowed: false,
    error: "Too many requests. Please try again later.",
  };
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
