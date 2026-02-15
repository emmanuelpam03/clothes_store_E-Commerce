"use server";
import prisma from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getProducts(query?: string, filter?: string) {
  noStore();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.product.findMany({
    where: {
      active: true,
      // select: {
      //   id: true,
      // name: true,
      //   slug: true,
      //   description: true,
      //   price: true,
      //   image: true,
      // },
      ...(query && {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(filter && filter !== "new" && filter !== "best-sellers"
        ? {
            category: {
              slug: filter,
            },
          }
        : {}),

      ...(filter === "new"
        ? {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          }
        : {}),

      ...(filter === "best-sellers"
        ? {
            orderItems: {
              some: {}, // only products that have sales
            },
          }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      image: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      image: true,
      active: true,
    },
  });
}

export async function createProduct() {
  const product = await prisma.product.create({
    data: {
      name: "Premium Signature Tee",
      slug: "premium-signature-tee",
      description: "High-end premium cotton signature t-shirt",
      image:
        "https://unsplash.com/photos/man-in-black-crew-neck-t-shirt-mlKE8dEMc_8",
      price: 2499,
      active: true,
      inventory: { create: { quantity: 15 } },
    },
  });

  return product;
}

export async function updateProduct() {
  // Add update product logic here
}

export async function deleteProduct() {
  // Add delete product logic here
}

export async function createDefaultCategories() {
  const categories = [
    { name: "Shirts", slug: "shirts" },
    { name: "T-Shirts", slug: "t-shirts" },
    { name: "Polo Shirts", slug: "polo-shirts" },
    { name: "Jeans", slug: "jeans" },
    { name: "Jackets", slug: "jackets" },
    { name: "Shorts", slug: "shorts" },
  ];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  return { success: true };
}
