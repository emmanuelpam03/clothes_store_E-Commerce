/**
 * Cleanup Script: Permanently Delete Deactivated Accounts After 90 Days
 *
 * This script should be run periodically (e.g., daily via cron job) to permanently
 * delete user accounts that have been deactivated for more than 90 days.
 *
 * Accounts are only deleted if:
 * - active is false
 * - deletedAt is set
 * - deletedAt is older than 90 days from now
 *
 * Run manually with:
 * npx tsx scripts/cleanup-deleted-accounts.ts
 *
 * Or set up a cron job for automated cleanup.
 */

import prisma from "@/lib/prisma";

async function cleanupDeletedAccounts() {
  try {
    console.log("🧹 Starting cleanup of deactivated accounts...");

    // Calculate the cutoff date (90 days ago)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    console.log(`📅 Cutoff date: ${ninetyDaysAgo.toISOString()}`);

    // Find accounts that meet the deletion criteria
    const accountsToDelete = await prisma.user.findMany({
      where: {
        active: false,
        deletedAt: {
          lte: ninetyDaysAgo, // deletedAt is less than or equal to 90 days ago
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        deletedAt: true,
      },
    });

    if (accountsToDelete.length === 0) {
      console.log("✨ No accounts to delete. All clear!");
      return;
    }

    console.log(
      `🗑️  Found ${accountsToDelete.length} account(s) to permanently delete:`,
    );
    accountsToDelete.forEach(
      (account: {
        email: string | null;
        name: string | null;
        deletedAt: Date | null;
      }) => {
        console.log(
          `   - ${account.email} (${account.name}) - Deleted on: ${account.deletedAt?.toISOString()}`,
        );
      },
    );

    // Confirm deletion (in production, you might want to skip this prompt)
    console.log(
      "\n⚠️  PERMANENT DELETION - These accounts will be completely removed.",
    );
    console.log("   This includes all orders, favorites, and cart data.");

    // Extract user IDs for deletion
    const userIds = accountsToDelete.map(
      (account: { id: string }) => account.id,
    );

    // Perform cascade deletion
    // Note: Prisma will handle cascade deletion based on your schema's onDelete rules
    const deletedCount = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    console.log(`\n✅ Successfully deleted ${deletedCount.count} account(s).`);
    console.log("🎉 Cleanup complete!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDeletedAccounts()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
