"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { generateTemporaryPassword } from "@/lib/utils";
import { sendEmail } from "@/lib/email/send-email";
import { OrderStatus, ReturnRequestStatus } from "@/app/generated/prisma/enums";
import { setPasswordSchema } from "@/lib/validators/set-password.schema";

/**
 * Escape HTML special characters to prevent HTML injection
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

type ReturnRequestRecord = {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: ReturnRequestStatus;
  adminNote: string | null;
  requestedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Admin Products
export async function getAllProductsAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.product.findMany({
    include: {
      category: true,
      department: true,
      inventory: true,
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductBySlugAdmin(slug: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      department: true,
      inventory: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function toggleProductStatus(productId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { active: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { active: !product.active },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAdmin(slug: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.product.delete({
    where: { slug },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  price: number; // in cents
  image?: string;
  categoryId?: string;
  departmentId?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  collection?: string;
  stock: number;
  active?: boolean;
  isFeatured?: boolean;
}

export async function createProductAdmin(input: CreateProductInput) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Validate required fields
  if (
    !input.name ||
    !input.slug ||
    input.price === undefined ||
    input.stock === undefined
  ) {
    throw new Error("Missing required fields");
  }

  // Validate numeric values
  if (isNaN(input.price) || input.price <= 0) {
    throw new Error("Price must be greater than 0");
  }

  if (isNaN(input.stock) || input.stock < 0) {
    throw new Error("Stock cannot be negative");
  }

  // Check if slug already exists
  const existingProduct = await prisma.product.findUnique({
    where: { slug: input.slug },
  });

  if (existingProduct) {
    throw new Error("A product with this slug already exists");
  }

  // Create product with inventory
  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      price: input.price,
      image: input.image || null,
      categoryId: input.categoryId || null,
      departmentId: input.departmentId || null,
      sizes: input.sizes || [],
      colors: input.colors || [],
      tags: input.tags || [],
      collection: input.collection || null,
      active: input.active ?? true,
      isFeatured: input.isFeatured ?? false,
      inventory: {
        create: {
          quantity: input.stock,
        },
      },
    },
    include: {
      category: true,
      department: true,
      inventory: true,
    },
  });

  revalidatePath("/admin/products");
  return { success: true, product };
}

export async function updateProductAdmin(
  slug: string,
  input: Partial<CreateProductInput>,
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { inventory: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Validate numeric values if provided
  if (input.price !== undefined && (isNaN(input.price) || input.price <= 0)) {
    throw new Error("Price must be greater than 0");
  }

  if (input.stock !== undefined && (isNaN(input.stock) || input.stock < 0)) {
    throw new Error("Stock cannot be negative");
  }

  // If slug is being changed, check for duplicates
  if (input.slug && input.slug !== product.slug) {
    const existingProduct = await prisma.product.findUnique({
      where: { slug: input.slug },
    });

    if (existingProduct) {
      throw new Error("A product with this slug already exists");
    }
  }

  // Update product
  const updatedProduct = await prisma.product.update({
    where: { slug },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.slug && { slug: input.slug }),
      ...(input.description !== undefined && {
        description: input.description || null,
      }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.image !== undefined && { image: input.image || null }),
      ...(input.categoryId !== undefined && {
        categoryId: input.categoryId || null,
      }),
      ...(input.departmentId !== undefined && {
        departmentId: input.departmentId || null,
      }),
      ...(input.sizes && { sizes: input.sizes }),
      ...(input.colors && { colors: input.colors }),
      ...(input.tags && { tags: input.tags }),
      ...(input.collection !== undefined && {
        collection: input.collection || null,
      }),
      ...(input.active !== undefined && { active: input.active }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
    },
    include: {
      category: true,
      department: true,
      inventory: true,
    },
  });

  // Update or create inventory if stock is provided
  if (input.stock !== undefined) {
    if (product.inventory) {
      // Update existing inventory
      await prisma.inventory.update({
        where: { id: product.inventory.id },
        data: { quantity: input.stock },
      });
    } else {
      // Create inventory record for legacy products
      await prisma.inventory.create({
        data: {
          productId: product.id,
          quantity: input.stock,
        },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${updatedProduct.slug}`);
  return { success: true, product: updatedProduct };
}

// Orders & Stats
export async function getAdminStats() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const [
    totalRevenue,
    todayOrders,
    activeProducts,
    totalCustomers,
    returnsRow,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.product.count({
      where: { active: true },
    }),
    prisma.user.count(),
    prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*)::int AS "count"
        FROM "return_requests"
      `,
  ]);

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    todayOrders,
    activeProducts,
    totalCustomers,
    returnsCount: returnsRow[0]?.count ?? 0,
  };
}

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

// Admin Order Management
export async function getAllOrdersAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (orders.length === 0) {
    return orders.map((order) => ({
      ...order,
      latestReturnRequest: null,
    }));
  }

  const orderIds = orders.map((order) => order.id);
  const returnRequests = await prisma.$queryRaw<ReturnRequestRecord[]>`
    SELECT DISTINCT ON ("order_id")
      "id",
      "order_id" AS "orderId",
      "user_id" AS "userId",
      "reason",
      "status",
      "admin_note" AS "adminNote",
      "requested_at" AS "requestedAt",
      "resolved_at" AS "resolvedAt",
      "created_at" AS "createdAt",
      "updated_at" AS "updatedAt"
    FROM "return_requests"
    WHERE "order_id" = ANY(${orderIds})
    ORDER BY "order_id", "requested_at" DESC
  `;

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

export async function getOrderByIdAdmin(orderId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              slug: true,
              active: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const returnRequests = await prisma.$queryRaw<ReturnRequestRecord[]>`
    SELECT
      "id",
      "order_id" AS "orderId",
      "user_id" AS "userId",
      "reason",
      "status",
      "admin_note" AS "adminNote",
      "requested_at" AS "requestedAt",
      "resolved_at" AS "resolvedAt",
      "created_at" AS "createdAt",
      "updated_at" AS "updatedAt"
    FROM "return_requests"
    WHERE "order_id" = ${orderId}
    ORDER BY "requested_at" DESC
  `;

  return {
    ...order,
    returnRequests,
  };
}

export async function getAllReturnRequestsAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const requests = await prisma.$queryRaw<
    Array<
      ReturnRequestRecord & {
        orderStatus: OrderStatus;
        orderTotal: number;
        orderCreatedAt: Date;
        customerName: string | null;
        customerEmail: string | null;
      }
    >
  >`
    SELECT
      rr."id" AS "id",
      rr."order_id" AS "orderId",
      rr."user_id" AS "userId",
      rr."reason" AS "reason",
      rr."status" AS "status",
      rr."admin_note" AS "adminNote",
      rr."requested_at" AS "requestedAt",
      rr."resolved_at" AS "resolvedAt",
      rr."created_at" AS "createdAt",
      rr."updated_at" AS "updatedAt",
      o."status" AS "orderStatus",
      o."total" AS "orderTotal",
      o."createdAt" AS "orderCreatedAt",
      u."name" AS "customerName",
      u."email" AS "customerEmail"
    FROM "return_requests" rr
    JOIN "Order" o ON o."id" = rr."order_id"
    LEFT JOIN "users" u ON u."id" = rr."user_id"
    ORDER BY rr."requested_at" DESC
  `;

  return requests;
}

export async function updateReturnRequestStatusAdmin(
  requestId: string,
  status: ReturnRequestStatus,
  adminNote?: string,
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const currentRows = await prisma.$queryRaw<
    Array<{ id: string; orderId: string; status: ReturnRequestStatus }>
  >`
    SELECT
      "id",
      "order_id" AS "orderId",
      "status" AS "status"
    FROM "return_requests"
    WHERE "id" = ${requestId}
    LIMIT 1
  `;

  const current = currentRows[0] ?? null;

  if (!current) {
    throw new Error("Return request not found");
  }

  const transitions: Record<ReturnRequestStatus, ReturnRequestStatus[]> = {
    [ReturnRequestStatus.REQUESTED]: [
      ReturnRequestStatus.APPROVED,
      ReturnRequestStatus.REJECTED,
    ],
    [ReturnRequestStatus.APPROVED]: [
      ReturnRequestStatus.RECEIVED,
      ReturnRequestStatus.REJECTED,
    ],
    [ReturnRequestStatus.REJECTED]: [],
    [ReturnRequestStatus.RECEIVED]: [ReturnRequestStatus.REFUNDED],
    [ReturnRequestStatus.REFUNDED]: [],
  };

  if (
    status !== current.status &&
    !transitions[current.status].includes(status)
  ) {
    throw new Error(
      `Invalid transition from ${current.status} to ${status}. Allowed: ${transitions[current.status].join(", ") || "none"}`,
    );
  }

  const note = adminNote?.trim() || null;
  const shouldResolve =
    status === ReturnRequestStatus.REJECTED ||
    status === ReturnRequestStatus.REFUNDED;

  await prisma.$executeRaw`
    UPDATE "return_requests"
    SET
      "status" = CAST(${status} AS "ReturnRequestStatus"),
      "admin_note" = ${note},
      "resolved_at" = ${shouldResolve ? new Date() : null},
      "updated_at" = NOW()
    WHERE "id" = ${requestId}
  `;

  revalidatePath("/admin/orders");
  revalidatePath("/admin/returns");
  revalidatePath("/admin/analytics");
  revalidatePath(`/admin/orders/${current.orderId}`);
  revalidatePath("/order");
  revalidatePath(`/order/${current.orderId}`);

  return { success: true };
}

export async function updateOrderStatusAdmin(
  orderId: string,
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED",
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Reject direct cancellation - must use cancelOrderAdmin
  if (status === "CANCELLED") {
    throw new Error(
      "Cannot set status to CANCELLED directly. Use cancelOrderAdmin to properly handle inventory restoration.",
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status;

  // Validate state transitions - enforce proper tracking
  const validTransitions: Record<string, string[]> = {
    PENDING: ["PAID", "SHIPPED"], // COD orders can skip payment (PENDING → SHIPPED)
    PAID: ["SHIPPED"], // Prepaid orders must be shipped before delivery
    SHIPPED: ["DELIVERED"],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
  };

  const allowedNextStates = validTransitions[currentStatus] || [];

  if (!allowedNextStates.includes(status)) {
    throw new Error(
      `Invalid status transition: Cannot change order from ${currentStatus} to ${status}. ` +
        (allowedNextStates.length > 0
          ? `Allowed next step: ${allowedNextStates.join(", ")}`
          : "This order status is final and cannot be changed."),
    );
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
      },
    });

    await tx.$executeRaw`
      INSERT INTO "order_status_history" ("id", "orderId", "status", "changedAt")
      VALUES (
        ${crypto.randomUUID()},
        ${orderId},
        CAST(${status as OrderStatus} AS "OrderStatus"),
        NOW()
      )
    `;

    return updated;
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true, order: updatedOrder };
}

export async function cancelOrderAdmin(orderId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // Prevent canceling delivered orders
  if (order.status === "DELIVERED") {
    throw new Error("Cannot cancel an order that has already been delivered");
  }

  // Prevent canceling already cancelled orders
  if (order.status === "CANCELLED") {
    throw new Error("Order is already cancelled");
  }

  // If order was PAID or SHIPPED, we should restore inventory
  if (order.status === "PAID" || order.status === "SHIPPED") {
    await prisma.$transaction(async (tx) => {
      // Restore inventory for cancelled orders
      for (const item of order.items) {
        // Use upsert to handle missing inventory records gracefully
        try {
          await tx.inventory.upsert({
            where: { productId: item.productId },
            update: {
              quantity: { increment: item.quantity },
            },
            create: {
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        } catch (error) {
          // Log warning if inventory restoration fails for a specific item
          console.warn(
            `Warning: Failed to restore inventory for product ${item.productId} in cancelled order ${orderId}:`,
            error,
          );
          // Continue processing other items
        }
      }

      // Update order status - always runs even if some inventory updates failed
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      await tx.$executeRaw`
        INSERT INTO "order_status_history" ("id", "orderId", "status", "changedAt")
        VALUES (
          ${crypto.randomUUID()},
          ${orderId},
          CAST(${OrderStatus.CANCELLED} AS "OrderStatus"),
          NOW()
        )
      `;
    });
  } else {
    // Just cancel if still pending
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      await tx.$executeRaw`
        INSERT INTO "order_status_history" ("id", "orderId", "status", "changedAt")
        VALUES (
          ${crypto.randomUUID()},
          ${orderId},
          CAST(${OrderStatus.CANCELLED} AS "OrderStatus"),
          NOW()
        )
      `;
    });
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

// Admin User Management
export async function getAllUsersAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    // Show all users including deactivated ones
    include: {
      _count: {
        select: {
          orders: true,
          favorites: true,
        },
      },
    },
    orderBy: [
      { active: "desc" }, // Active users first
      { email: "asc" },
    ],
  });

  return users;
}

export async function getUserByIdAdmin(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: {
          orders: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate total spent across ALL orders (not just the 10 recent ones)
  const ordersTotal = await prisma.order.aggregate({
    where: { userId },
    _sum: {
      total: true,
    },
  });

  return {
    ...user,
    ordersTotal: ordersTotal._sum.total || 0,
  };
}

export async function updateUserRoleAdmin(
  userId: string,
  role: "USER" | "ADMIN",
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent changing own role
  if (session.user.id === userId) {
    throw new Error("Cannot change your own role");
  }

  // Verify target user exists and is active
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, active: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (!targetUser.active) {
    throw new Error("Cannot modify role of deleted/inactive user");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, user };
}

export async function deleteUserAdmin(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent deleting own account
  if (session.user.id === userId) {
    throw new Error("Cannot delete your own account");
  }

  // Verify user exists and is not already deleted
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, active: true, deletedAt: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (!targetUser.active || targetUser.deletedAt) {
    throw new Error("User is already deleted");
  }

  // Soft delete: mark as inactive and set deletedAt timestamp
  await prisma.user.update({
    where: { id: userId },
    data: {
      active: false,
      deletedAt: new Date(),
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminSetUserPasswordAdmin(
  userId: string,
  newPassword: string,
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (session.user.id === userId) {
    throw new Error("Use your profile to change your own password");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, active: true },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (!targetUser.active) {
    throw new Error("Cannot reset password for a deactivated user");
  }

  const validation = setPasswordSchema.safeParse({
    password: newPassword,
    confirmPassword: newPassword,
  });

  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    throw new Error(errors.password?.[0] || "Invalid password");
  }

  const hashedPassword = await hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        requirePasswordChange: true,
        passwordChangeDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Force logout on all devices
    await tx.session.deleteMany({
      where: { userId },
    });
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

// Create User by Admin
export async function createUserAdmin(data: {
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  sendEmail?: boolean;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Generate secure temporary password
  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await hash(temporaryPassword, 10);

  // Create user with temporary password
  // Admin-created accounts are auto-verified but require password change
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      emailVerified: new Date(), // Auto-verify for admin-created accounts
      requirePasswordChange: true,
      passwordChangeDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send credentials via email if requested
  if (data.sendEmail) {
    try {
      // Escape values to prevent HTML injection
      const escapedEmail = escapeHtml(data.email);
      const escapedPassword = escapeHtml(temporaryPassword);
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const loginUrl = `${baseUrl}/login`;

      await sendEmail({
        to: data.email,
        subject: "Your Account Has Been Created",
        html: `
          <h2>Welcome to the platform!</h2>
          <p>An administrator has created an account for you.</p>
          <p><strong>Your login credentials:</strong></p>
          <ul>
            <li>Email: ${escapedEmail}</li>
            <li>Temporary Password: <code>${escapedPassword}</code></li>
          </ul>
          <p><strong>Important:</strong> You must change your password when you first log in.</p>
          <p>For security reasons, this temporary password will expire in 7 days.</p>
          <p><a href="${loginUrl}">Log in now</a></p>
        `,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      // Don't fail the user creation if email fails
      // Return the password so admin can manually share it
    }
  }

  revalidatePath("/admin/users");

  // Return temporary password so admin can share it
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    temporaryPassword: temporaryPassword,
    message: data.sendEmail
      ? "User created and credentials sent via email"
      : "User created successfully. Share the temporary password with the user.",
  };
}
