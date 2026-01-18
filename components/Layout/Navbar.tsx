import { auth } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function Navbar() {
  const session = await auth();

  let user = null;
  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true, role: true },
    });
  }

  const updatedSession = session
    ? { ...session, user: { ...session.user, ...user } }
    : null;

  return <NavbarClient session={updatedSession} />;
}
