"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function unlinkGoogleAction() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch user + linked accounts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Find Google account
  const googleAccount = user.accounts.find((acc) => acc.provider === "google");

  if (!googleAccount) {
    // Nothing to unlink
    return;
  }

  // 🚨 SAFETY CHECKS
  const hasPassword = Boolean(user.password);
  const authMethodCount = user.accounts.length + (hasPassword ? 1 : 0);

  if (!hasPassword && authMethodCount <= 1) {
    throw new Error(
      "You must set a password before unlinking your Google account."
    );
  }

  // ✅ Unlink Google
  await prisma.account.delete({
    where: { id: googleAccount.id },
  });

  redirect("/profile");
}
