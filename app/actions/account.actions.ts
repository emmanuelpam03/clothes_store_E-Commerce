"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * CHECK IF GOOGLE CAN BE LINKED
 * Prevents redirect to NextAuth default OAuthAccountNotLinked page
 */
export async function canLinkGoogleAction() {
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    return { ok: false };
  }

  const existingGoogleAccount = await prisma.account.findFirst({
    where: {
      provider: "google",
      NOT: {
        userId: session.user.id,
      },
    },
  });

  if (existingGoogleAccount) {
    return {
      ok: false,
      reason: "GOOGLE_ALREADY_LINKED",
    };
  }

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

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
    },
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
