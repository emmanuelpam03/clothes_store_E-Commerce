"use server";

import prisma from "@/lib/prisma";

export async function backfillOrderItemSnapshots() {
  const items = await prisma.orderItem.findMany({
    where: {
      OR: [{ image: null }, { name: null }],
    },
    include: {
      product: true,
    },
  });

  for (const item of items) {
    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        image: item.product.image ?? "",
        name: item.product.name,
      },
    });
  }

  return { updated: items.length };
}
