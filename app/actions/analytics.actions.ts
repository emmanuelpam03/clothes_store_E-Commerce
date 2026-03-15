"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrderStatus, ReturnRequestStatus } from "@/app/generated/prisma/enums";

export async function getAnalyticsData() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthRows = await prisma.$queryRaw<
    Array<{ revenue: number; orders: number }>
  >`
    WITH latest_rr AS (
      SELECT DISTINCT ON (rr."order_id")
        rr."order_id" AS "orderId",
        rr."status" AS "status"
      FROM "return_requests" rr
      ORDER BY rr."order_id", rr."updated_at" DESC, rr."requested_at" DESC
    )
    SELECT
      COALESCE(SUM(o."total"), 0)::int AS "revenue",
      COUNT(*)::int AS "orders"
    FROM "Order" o
    LEFT JOIN latest_rr lr ON lr."orderId" = o."id"
    WHERE o."status" IN (
      CAST(${OrderStatus.PAID} AS "OrderStatus"),
      CAST(${OrderStatus.SHIPPED} AS "OrderStatus"),
      CAST(${OrderStatus.DELIVERED} AS "OrderStatus")
    )
      AND (lr."status" IS NULL OR lr."status" <> CAST(${ReturnRequestStatus.REFUNDED} AS "ReturnRequestStatus"))
      AND o."createdAt" >= ${startOfMonth}
  `;

  const lastMonthRows = await prisma.$queryRaw<
    Array<{ revenue: number; orders: number }>
  >`
    WITH latest_rr AS (
      SELECT DISTINCT ON (rr."order_id")
        rr."order_id" AS "orderId",
        rr."status" AS "status"
      FROM "return_requests" rr
      ORDER BY rr."order_id", rr."updated_at" DESC, rr."requested_at" DESC
    )
    SELECT
      COALESCE(SUM(o."total"), 0)::int AS "revenue",
      COUNT(*)::int AS "orders"
    FROM "Order" o
    LEFT JOIN latest_rr lr ON lr."orderId" = o."id"
    WHERE o."status" IN (
      CAST(${OrderStatus.PAID} AS "OrderStatus"),
      CAST(${OrderStatus.SHIPPED} AS "OrderStatus"),
      CAST(${OrderStatus.DELIVERED} AS "OrderStatus")
    )
      AND (lr."status" IS NULL OR lr."status" <> CAST(${ReturnRequestStatus.REFUNDED} AS "ReturnRequestStatus"))
      AND o."createdAt" >= ${startOfLastMonth}
      AND o."createdAt" < ${startOfMonth}
  `;

  const currentMonthRevenue = currentMonthRows[0]?.revenue ?? 0;
  const currentMonthOrdersCount = currentMonthRows[0]?.orders ?? 0;

  const lastMonthRevenue = lastMonthRows[0]?.revenue ?? 0;
  const lastMonthOrdersCount = lastMonthRows[0]?.orders ?? 0;

  // Calculate revenue change percentage
  const revenueChange =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Get average order value (current month)
  const averageOrderValue =
    currentMonthOrdersCount > 0
      ? currentMonthRevenue / currentMonthOrdersCount
      : 0;

  // Get last month average order value
  const lastMonthAverageOrderValue =
    lastMonthOrdersCount > 0 ? lastMonthRevenue / lastMonthOrdersCount : 0;

  // Calculate average order value change
  const avgOrderValueChange =
    lastMonthAverageOrderValue > 0
      ? ((averageOrderValue - lastMonthAverageOrderValue) /
          lastMonthAverageOrderValue) *
        100
      : 0;

  const allTimeRows = await prisma.$queryRaw<
    Array<{ revenue: number; orders: number }>
  >`
    WITH latest_rr AS (
      SELECT DISTINCT ON (rr."order_id")
        rr."order_id" AS "orderId",
        rr."status" AS "status"
      FROM "return_requests" rr
      ORDER BY rr."order_id", rr."updated_at" DESC, rr."requested_at" DESC
    )
    SELECT
      COALESCE(SUM(o."total"), 0)::int AS "revenue",
      COUNT(*)::int AS "orders"
    FROM "Order" o
    LEFT JOIN latest_rr lr ON lr."orderId" = o."id"
    WHERE o."status" IN (
      CAST(${OrderStatus.PAID} AS "OrderStatus"),
      CAST(${OrderStatus.SHIPPED} AS "OrderStatus"),
      CAST(${OrderStatus.DELIVERED} AS "OrderStatus")
    )
      AND (lr."status" IS NULL OR lr."status" <> CAST(${ReturnRequestStatus.REFUNDED} AS "ReturnRequestStatus"))
  `;

  const totalRevenue = allTimeRows[0]?.revenue ?? 0;
  const totalOrders = allTimeRows[0]?.orders ?? 0;
  const allTimeAverageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate orders change
  const ordersChange =
    lastMonthOrdersCount > 0
      ? ((currentMonthOrdersCount - lastMonthOrdersCount) /
          lastMonthOrdersCount) *
        100
      : 0;

  // Get total customers
  const totalCustomers = await prisma.user.count({
    where: {
      role: "USER",
      deletedAt: null,
    },
  });

  return {
    currentMonthRevenue,
    lastMonthRevenue,
    revenueChange,
    averageOrderValue,
    avgOrderValueChange,
    totalOrders,
    currentMonthOrdersCount,
    ordersChange,
    totalRevenue,
    allTimeAverageOrderValue,
    totalCustomers,
  };
}

export async function getTopProducts(limit: number = 10) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Get top products by order items count
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  // Get product details
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      image: true,
    },
  });

  // Merge data
  const topProductsWithDetails = topProducts.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return [];
    return [
      {
        ...product,
        totalSold: item._sum.quantity || 0,
      },
    ];
  });

  return topProductsWithDetails;
}

export async function getRevenueByMonth(months: number = 6) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

  // Fetch all non-refunded orders for the date range in one query
  const orders = await prisma.$queryRaw<
    Array<{ total: number; createdAt: Date }>
  >`
    WITH latest_rr AS (
      SELECT DISTINCT ON (rr."order_id")
        rr."order_id" AS "orderId",
        rr."status" AS "status"
      FROM "return_requests" rr
      ORDER BY rr."order_id", rr."updated_at" DESC, rr."requested_at" DESC
    )
    SELECT
      o."total" AS "total",
      o."createdAt" AS "createdAt"
    FROM "Order" o
    LEFT JOIN latest_rr lr ON lr."orderId" = o."id"
    WHERE o."status" IN (
      CAST(${OrderStatus.PAID} AS "OrderStatus"),
      CAST(${OrderStatus.SHIPPED} AS "OrderStatus"),
      CAST(${OrderStatus.DELIVERED} AS "OrderStatus")
    )
      AND (lr."status" IS NULL OR lr."status" <> CAST(${ReturnRequestStatus.REFUNDED} AS "ReturnRequestStatus"))
      AND o."createdAt" >= ${startDate}
  `;

  // Group orders by month
  const monthsData = [];
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      1,
    );

    const monthOrders = orders.filter(
      (order) =>
        order.createdAt >= monthDate && order.createdAt < nextMonthDate,
    );

    const monthRevenue = monthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    monthsData.push({
      month: monthDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      revenue: monthRevenue,
      orders: monthOrders.length,
    });
  }

  return monthsData;
}

export async function getCategoryStats() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Get all categories with product counts
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      products: {
        select: {
          id: true,
        },
      },
    },
  });

  // Get all order items for completed orders in one query
  const allOrderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: {
          in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
      },
    },
    select: {
      productId: true,
      price: true,
      quantity: true,
    },
  });

  // Build a map of productId to category
  const productToCategoryMap = new Map<string, string>();
  categories.forEach((category) => {
    category.products.forEach((product) => {
      productToCategoryMap.set(product.id, category.id);
    });
  });

  // Aggregate stats by category
  const categoryStatsMap = new Map<
    string,
    { revenue: number; itemsSold: number }
  >();

  allOrderItems.forEach((item) => {
    const categoryId = productToCategoryMap.get(item.productId);
    if (categoryId) {
      const existing = categoryStatsMap.get(categoryId) || {
        revenue: 0,
        itemsSold: 0,
      };
      categoryStatsMap.set(categoryId, {
        revenue: existing.revenue + item.price * item.quantity,
        itemsSold: existing.itemsSold + item.quantity,
      });
    }
  });

  // Build final result
  const categoryStats = categories.map((category) => {
    const stats = categoryStatsMap.get(category.id) || {
      revenue: 0,
      itemsSold: 0,
    };
    return {
      name: category.name,
      revenue: stats.revenue,
      itemsSold: stats.itemsSold,
      productCount: category.products.length,
    };
  });

  return categoryStats.sort((a, b) => b.revenue - a.revenue);
}

export async function getRecentOrders(limit: number = 10) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const recentOrders = await prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const orderIds = recentOrders.map((order) => order.id);
  if (orderIds.length === 0) {
    return recentOrders.map((order) => ({ ...order, uiStatus: order.status }));
  }

  const latestReturnRows = await prisma.$queryRaw<
    Array<{ orderId: string; status: ReturnRequestStatus }>
  >`
    SELECT DISTINCT ON (rr."order_id")
      rr."order_id" AS "orderId",
      rr."status" AS "status"
    FROM "return_requests" rr
    WHERE rr."order_id" = ANY(${orderIds})
    ORDER BY rr."order_id", rr."updated_at" DESC, rr."requested_at" DESC
  `;

  const latestReturnStatusByOrderId = new Map(
    latestReturnRows.map((row) => [row.orderId, row.status] as const),
  );

  return recentOrders.map((order) => {
    const latestReturnStatus = latestReturnStatusByOrderId.get(order.id);
    const uiStatus =
      latestReturnStatus === ReturnRequestStatus.REFUNDED
        ? "RETURNED"
        : order.status;

    return { ...order, uiStatus };
  });
}

export async function getOrderStatusDistribution() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  return statusCounts.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));
}
