import ProfileClient from "@/components/shop/ProfileClient";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // 🔹 Mock data (replace later)
  // const user = {
  //   name: "John Doe",
  //   email: "john@example.com",
  //   image: null,
  // };
  const session = await auth();
  if (!session) {
    redirect("/login");
  }


  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      password: true,
      emailVerified: true,
      accounts: {
        select: { provider: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const hasGoogle = user.accounts.some(
    (account) => account.provider === "google"
  );

  const hasPassword = Boolean(user.password);

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-16">
      <ProfileClient
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
        }}
        hasGoogle={hasGoogle}
        hasPassword={hasPassword}
      />
    </div>
  );
}
