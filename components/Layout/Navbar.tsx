import { auth } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function Navbar() {
  const session = await auth();

  let user = null;
  let favoriteCount = 0;
  if (session?.user?.id) {
    [user, favoriteCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, role: true },
      }),
      prisma.favorite.count({ where: { userId: session.user.id } }),
    ]);
  }

  const updatedSession = session
    ? { ...session, user: { ...session.user, ...user } }
    : null;

  return <NavbarClient session={updatedSession} favoriteCount={favoriteCount} />;
}
