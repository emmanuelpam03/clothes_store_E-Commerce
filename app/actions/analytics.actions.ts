"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@/app/generated/prisma/enums";

export async function getAnalyticsData() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get current month revenue
  const currentMonthOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
      createdAt: {
        gte: startOfMonth,
      },
    },
    select: {
      total: true,
    },
  });

  const currentMonthRevenue = currentMonthOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  // Get last month revenue
  const lastMonthOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
      createdAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
    select: {
      total: true,
    },
  });

  const lastMonthRevenue = lastMonthOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  // Calculate revenue change percentage
  const revenueChange =
    lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  // Get average order value (current month)
  const averageOrderValue =
    currentMonthOrders.length > 0
      ? currentMonthRevenue / currentMonthOrders.length
      : 0;

  // Get last month average order value
  const lastMonthAverageOrderValue =
    lastMonthOrders.length > 0 ? lastMonthRevenue / lastMonthOrders.length : 0;

  // Calculate average order value change
  const avgOrderValueChange =
    lastMonthAverageOrderValue > 0
      ? ((averageOrderValue - lastMonthAverageOrderValue) /
          lastMonthAverageOrderValue) *
        100
      : 0;

  // Get total orders count
  const totalOrders = await prisma.order.count({
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
    },
  });

  // Get current month orders
  const currentMonthOrdersCount = currentMonthOrders.length;

  // Get last month orders count
  const lastMonthOrdersCount = lastMonthOrders.length;

  // Calculate orders change
  const ordersChange =
    lastMonthOrdersCount > 0
      ? ((currentMonthOrdersCount - lastMonthOrdersCount) /
          lastMonthOrdersCount) *
        100
      : 0;

  // Get total revenue (all time)
  const allOrders = await prisma.order.findMany({
    where: {
      status: {
        in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
    },
    select: {
      total: true,
    },
  });

  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);

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
  const monthsData = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      1,
    );

    const monthOrders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
        },
        createdAt: {
          gte: monthDate,
          lt: nextMonthDate,
        },
      },
      select: {
        total: true,
      },
    });

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

  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            include: {
              order: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const categoryStats = categories.map((category) => {
    let totalRevenue = 0;
    let totalSold = 0;

    category.products.forEach((product) => {
      product.orderItems.forEach((item) => {
        if (
          item.order.status === OrderStatus.PAID ||
          item.order.status === OrderStatus.SHIPPED ||
          item.order.status === OrderStatus.DELIVERED
        ) {
          totalRevenue += item.price * item.quantity;
          totalSold += item.quantity;
        }
      });
    });

    return {
      name: category.name,
      revenue: totalRevenue,
      itemsSold: totalSold,
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

  return recentOrders;
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
