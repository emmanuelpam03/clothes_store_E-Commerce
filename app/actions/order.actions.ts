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

  return prisma.$transaction(async (tx) => {
    // 1️⃣ Get cart with items
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { inventory: true } } },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2️⃣ Validate inventory
    for (const item of cart.items) {
      if (!item.product.inventory) {
        throw new Error("Inventory missing");
      }

      if (item.product.inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`);
      }
    }

    // 3️⃣ Create order
    const order = await tx.order.create({
      data: {
        userId,
        total: cart.items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),
      },
    });

    // 4️⃣ Create order items (snapshots)
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
        name: item.product.name,
        image: item.product.image,
      })),
    });

    // 5️⃣ Decrement inventory
    for (const item of cart.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    // 6️⃣ Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
}

export async function getOrders() {
  // Add get orders logic here
}

export async function getOrderById(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("Order not found");
  }

  return order;
}

export async function updateOrderStatus() {
  // Add update order status logic here
}
