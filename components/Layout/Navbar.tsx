import { auth } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";

export const dynamic = "force-dynamic";

export async function Navbar() {
  const session = await auth();
  console.log("SESSION:", session?.user);

  return <NavbarClient session={session} />;
}
