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

  if (!user || user.emailVerified) {
    redirect("/profile");
  }

  return session.user;
}
