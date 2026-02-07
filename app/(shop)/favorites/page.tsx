import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import FavoritesClient from "@/components/shop/FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          image: true,
          description: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = favorites.map((fav) => fav.product);

  return <FavoritesClient products={products} />;
}
