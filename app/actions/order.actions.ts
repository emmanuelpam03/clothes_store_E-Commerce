"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type CartItem = {
  productId: string;
  quantity: number;
};

type ShippingDetails = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
};

function validateShippingDetails(details: ShippingDetails): void {
  const requiredFields: (keyof ShippingDetails)[] = [
    "email",
    "phone",
    "firstName",
    "lastName",
    "address",
    "city",
    "zipCode",
    "country",
  ];
  for (const field of requiredFields) {
    if (!details[field] || details[field].trim() === "") {
      throw new Error(`${field} is required`);
    }
  }
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
    throw new Error("Invalid email format");
  }
}

export async function createOrderAction(
  items: CartItem[],
  shippingDetails: ShippingDetails,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  validateShippingDetails(shippingDetails);

  const userId = session.user.id;

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  return prisma.$transaction(
    async (tx) => {
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
            0,
          ),
          email: shippingDetails.email,
          phone: shippingDetails.phone,
          firstName: shippingDetails.firstName,
          lastName: shippingDetails.lastName,
          address: shippingDetails.address,
          city: shippingDetails.city,
          zipCode: shippingDetails.zipCode,
          country: shippingDetails.country,
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
          size: item.size,
          color: item.color,
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
    },
    { timeout: 15000 },
  );
}

export async function getOrders() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders;
}

export async function getOrderById(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
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

export async function cancelOrder(orderId: string) {
  // Add cancel order logic here
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // get the order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // check if the order belongs to the user
  if (order.userId !== session.user.id) {
    throw new Error("Forbidden");
  }

  // check if order is already paid for or is aleady shipped
  if (order.status !== "PENDING") {
    throw new Error(
      "Cannot cancel a paid order or an order that is already shipped",
    );
  }

  // update the order status
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/order");

  return updatedOrder;
}
