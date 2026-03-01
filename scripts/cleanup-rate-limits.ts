/**
 * Cleanup Script: Remove Expired Rate Limit Records
 *
 * This script removes expired rate limit records from the database
 * to prevent unbounded growth and maintain optimal query performance.
 *
 * NOTE: Automatic cleanup is built into the rate limiter (5% probability per call).
 * This script is OPTIONAL and can be used for manual cleanup or aggressive maintenance.
 *
 * Usage: pnpm tsx scripts/cleanup-rate-limits.ts
 */

import prisma from "@/lib/prisma";
import { cleanupExpiredRateLimits } from "@/lib/rate-limit";

async function main() {
  try {
    console.log("🧹 Starting cleanup of expired rate limit records...");

    const deletedCount = await cleanupExpiredRateLimits();

    if (deletedCount > 0) {
      console.log(
        `\n✅ Successfully removed ${deletedCount} expired rate limit record(s).`,
      );
    } else {
      console.log("\n✨ No expired rate limit records to remove.");
    }

    console.log("\n🎉 Cleanup completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
