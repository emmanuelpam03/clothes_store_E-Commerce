"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Admin Products
export async function getAllProductsAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return prisma.product.findMany({
    include: {
      category: true,
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

  const [totalRevenue, todayOrders, activeProducts, totalCustomers] =
    await Promise.all([
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
    ]);

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    todayOrders,
    activeProducts,
    totalCustomers,
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
