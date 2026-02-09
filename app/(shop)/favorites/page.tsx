import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FavoritesClient from "@/components/shop/FavoritesClient";
import { Suspense } from "react";
import FavoritesSkeleton from "@/components/shop/skeleton/FavoritesSkeleton";

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <FavoritesClient isGuest />;
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

  return (
    <Suspense fallback={<FavoritesSkeleton />}>
      <FavoritesClient products={products} />
    </Suspense>
  );
}
