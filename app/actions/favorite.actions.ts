"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function toggleFavorite(productId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existing) {
    // Remove favorite
    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return { isFavorited: false };
  } else {
    // Add favorite
    await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
    return { isFavorited: true };
  }
}

export async function getUserFavorites() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return favorites.map((fav) => fav.productId);
}
