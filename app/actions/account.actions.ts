"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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

/**
 * SET PASSWORD ACTION
 */
export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData
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
        errors.password?.[0] ||
        errors.confirmPassword?.[0] ||
        "Invalid input",
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
