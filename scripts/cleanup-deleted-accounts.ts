/**
 * Cleanup Script: Handle Deleted Accounts After 90 Days
 *
 * This script handles two types of deleted accounts:
 * 1. Deactivated accounts (soft delete) - anonymizes personal data after 90 days
 * 2. Already anonymized accounts - removes the user record after 90 days
 *
 * Note: Deactivated accounts are processed in two steps:
 * - PART 1 anonymizes the account and deletes related auth artifacts.
 * - PART 2 deletes the anonymized user record on a subsequent run.
 *
 * Run manually with:
 * npx tsx scripts/cleanup-deleted-accounts.ts
 *
 * Or set up a cron job for automated cleanup.
 */

import prisma from "@/lib/prisma";

async function permanentlyDeleteUser(userId: string) {
  // PART 1/2: anonymize personal data and remove related auth artifacts.
  // The anonymized user record itself is deleted in PART 2 on a subsequent run.
  // Use transaction to ensure all operations succeed together
  await prisma.$transaction(
    async (tx) => {
      // 1. Anonymize user's personal data
      // Note: Preserve existing deletedAt to maintain original 90-day countdown
      const anonymizedEmail = `deleted_${userId}@deleted.local`;
      await tx.user.update({
        where: { id: userId },
        data: {
          active: false,
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
    },
    {
      timeout: 15000, // 15 seconds (increased from default 5s for large datasets)
    },
  );
}

async function cleanupDeletedAccounts() {
  try {
    console.log("🧹 Starting cleanup of deleted accounts...");

    // Calculate the cutoff date (90 days ago)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    console.log(`📅 Cutoff date: ${ninetyDaysAgo.toISOString()}`);

    // ======================================================
    // PART 1: Handle deactivated accounts (not anonymized)
    // ======================================================
    const deactivatedAccounts = await prisma.user.findMany({
      where: {
        active: false,
        deletedAt: {
          lte: ninetyDaysAgo,
          not: null,
        },
        email: {
          not: {
            startsWith: "deleted_",
          },
        },
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (deactivatedAccounts.length > 0) {
      console.log(
        `\nFound ${deactivatedAccounts.length} deactivated account(s) to anonymize (user record deletion happens in PART 2 on a subsequent run)`,
      );
      console.log("   Anonymization details:");
      deactivatedAccounts.forEach((account) => {
        console.log(
          `   - Account ${account.id} deactivated on: ${account.deletedAt?.toISOString()}`,
        );
      });

      // PART 1/2: anonymize each deactivated account (record deletion occurs in PART 2 on a subsequent run)
      for (const account of deactivatedAccounts) {
        await permanentlyDeleteUser(account.id);
        console.log(
          `   Anonymized account: ${account.id} (user record deletion happens in PART 2 on a subsequent run)`,
        );
      }

      console.log(
        `\nSuccessfully anonymized ${deactivatedAccounts.length} deactivated account(s). User record deletion happens in PART 2 on a subsequent run.`,
      );
    } else {
      console.log("\nNo deactivated accounts to process.");
    }

    // ======================================================
    // PART 2: Remove already anonymized accounts
    // ======================================================
    const anonymizedAccounts = await prisma.user.findMany({
      where: {
        active: false,
        deletedAt: {
          lte: ninetyDaysAgo,
          not: null,
        },
        email: {
          startsWith: "deleted_",
        },
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (anonymizedAccounts.length > 0) {
      console.log(
        `\nFound ${anonymizedAccounts.length} anonymized account(s) to remove`,
      );
      console.log("   Removal details:");
      anonymizedAccounts.forEach((account) => {
        console.log(
          `   - Account ${account.id} deleted on: ${account.deletedAt?.toISOString()}`,
        );
      });

      const userIds = anonymizedAccounts.map((account) => account.id);

      // Delete the anonymized user records
      const deletedCount = await prisma.user.deleteMany({
        where: {
          id: {
            in: userIds,
          },
          active: false,
          email: {
            startsWith: "deleted_",
          },
        },
      });

      console.log(
        `\nSuccessfully removed ${deletedCount.count} anonymized account(s).`,
      );
    } else {
      console.log("\nNo anonymized accounts to remove.");
    }

    if (deactivatedAccounts.length === 0 && anonymizedAccounts.length === 0) {
      console.log("\nAll clear. No accounts to process.");
    } else {
      console.log("\nOrder history preserved for business records.");
      console.log("Cleanup complete.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
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
