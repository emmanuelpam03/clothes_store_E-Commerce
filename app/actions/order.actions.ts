"use server";


import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type CartItem = {
  productId: string;
  quantity: number;
};

export async function createOrderAction(items: CartItem[]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Fetch products + inventory
    const products = await tx.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        active: true,
      },
      include: {
        inventory: true,
      },
    });

    if (products.length !== items.length) {
      throw new Error("One or more products are invalid or inactive");
    }

    // 2️⃣ Validate + compute total
    let total = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product || !product.inventory) {
        throw new Error("Inventory missing");
      }

      if (product.inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      total += product.price * item.quantity;
    }

    // 3️⃣ Create order
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
      },
    });

    // 4️⃣ Create order items
    await tx.orderItem.createMany({
      data: items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;

        return {
          orderId: order.id,
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        };
      }),
    });

    // 5️⃣ Decrement inventory
    for (const item of items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    return order;
  });
}

export async function getOrders() {
  // Add get orders logic here
}

export async function getOrder(id: string) {
  // Add get order logic here
}

export async function updateOrderStatus() {
  // Add update order status logic here
}
