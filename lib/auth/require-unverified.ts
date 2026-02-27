"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireUnverifiedUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });

  // If user doesn't exist in DB, redirect to login
  if (!user) {
    redirect("/login");
  }

  // If email is already verified, redirect to home
  if (user.emailVerified) {
    redirect("/");
  }

  return session.user;
}
