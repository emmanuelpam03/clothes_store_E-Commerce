"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, ReturnRequestStatus } from "@/app/generated/prisma/enums";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

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

type ReturnRequestRecord = {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: ReturnRequestStatus;
  adminNote: string | null;
  requestedAt: Date;
  resolvedAt: Date | null;
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
  const storeSettings = await getStoreSettings();

  if (items.length === 0) {
    throw new Error("Cart is empty");
  }

  return prisma.$transaction(
    async (tx) => {
      // 1️⃣ Fetch products and validate inventory
      const products = await tx.product.findMany({
        where: {
          id: { in: items.map((item) => item.productId) },
        },
        include: { inventory: true },
      });

      if (products.length !== items.length) {
        throw new Error("Some products not found");
      }

      // 2️⃣ Validate inventory
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (!product.inventory) {
          throw new Error(`Inventory missing for ${product.name}`);
        }

        if (product.inventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      // 3️⃣ Create order
      const subtotal = items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return sum + product.price * item.quantity;
      }, 0);

      const shippingCost =
        subtotal >= storeSettings.freeShippingThresholdCents
          ? 0
          : storeSettings.shippingCostCents;

      const order = await tx.order.create({
        data: {
          userId,
          total: subtotal + shippingCost,
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

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
        },
      });

      // 4️⃣ Create order items (snapshots)
      await tx.orderItem.createMany({
        data: items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            name: product.name,
            image: product.image,
            size: "M", // Default size since client cart doesn't include it
            color: "", // Default color since client cart doesn't include it
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

      // 6️⃣ Clear database cart if it exists
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

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

  if (orders.length === 0) {
    return orders.map((order) => ({
      ...order,
      latestReturnRequest: null,
    }));
  }

  const orderIds = orders.map((order) => order.id);
  const returnRequests = await prisma.returnRequest.findMany({
    where: {
      userId: session.user.id,
      orderId: { in: orderIds },
    },
    select: {
      id: true,
      orderId: true,
      userId: true,
      reason: true,
      status: true,
      adminNote: true,
      requestedAt: true,
      resolvedAt: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  const latestByOrder = new Map<string, ReturnRequestRecord>();
  for (const request of returnRequests) {
    if (!latestByOrder.has(request.orderId)) {
      latestByOrder.set(request.orderId, request);
    }
  }

  return orders.map((order) => ({
    ...order,
    latestReturnRequest: latestByOrder.get(order.id) ?? null,
  }));
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

  if (!order || !order.userId || order.userId !== session.user.id) {
    throw new Error("Order not found");
  }

  const returnRequests = await prisma.returnRequest.findMany({
    where: {
      userId: session.user.id,
      orderId,
    },
    select: {
      id: true,
      orderId: true,
      userId: true,
      reason: true,
      status: true,
      adminNote: true,
      requestedAt: true,
      resolvedAt: true,
    },
    orderBy: { requestedAt: "desc" },
  });

  return {
    ...order,
    returnRequests,
  };
}

export async function createReturnRequest(orderId: string, reason: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 10) {
    throw new Error(
      "Please provide at least 10 characters for the return reason",
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      deliveredAt: true,
    },
  });

  if (!order || !order.userId || order.userId !== session.user.id) {
    throw new Error("Order not found");
  }

  if (order.status !== "DELIVERED") {
    throw new Error("Returns can only be requested for delivered orders");
  }

  const deliveredAtFromHistory = order.deliveredAt
    ? null
    : await prisma.orderStatusHistory.findFirst({
        where: {
          orderId,
          status: OrderStatus.DELIVERED,
        },
        orderBy: { changedAt: "desc" },
        select: { changedAt: true },
      });

  const deliveredAt = order.deliveredAt ?? deliveredAtFromHistory?.changedAt;

  const storeSettings = await getStoreSettings();
  const returnWindowMs = storeSettings.returnWindowDays * 24 * 60 * 60 * 1000;
  const isWithinWindow =
    deliveredAt !== undefined &&
    deliveredAt !== null &&
    Date.now() - new Date(deliveredAt).getTime() <= returnWindowMs;
  if (!isWithinWindow) {
    throw new Error(
      `Return window closed. Returns are accepted within ${storeSettings.returnWindowDays} days of delivery.`,
    );
  }

  const existingOpenRequest = await prisma.returnRequest.findFirst({
    where: {
      orderId,
      userId: session.user.id,
      status: {
        in: [
          ReturnRequestStatus.REQUESTED,
          ReturnRequestStatus.APPROVED,
          ReturnRequestStatus.RECEIVED,
        ],
      },
    },
    select: { id: true },
  });

  if (existingOpenRequest) {
    throw new Error("A return request is already active for this order");
  }

  await prisma.returnRequest.create({
    data: {
      orderId,
      userId: session.user.id,
      reason: trimmedReason,
      status: ReturnRequestStatus.REQUESTED,
    },
  });

  revalidatePath("/order");
  revalidatePath(`/order/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/returns");

  return { success: true };
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
  if (!order.userId || order.userId !== session.user.id) {
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

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: OrderStatus.CANCELLED,
    },
  });

  revalidatePath("/order");

  return updatedOrder;
}
