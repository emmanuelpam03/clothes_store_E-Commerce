"use server";
import prisma from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";

export interface ProductFilters {
  query?: string;
  filter?: string;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  collections?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  outOfStock?: boolean;
}

export async function getProducts(filters: ProductFilters = {}) {
  noStore();

  const {
    query,
    filter,
    sizes,
    colors,
    tags,
    collections,
    minPrice,
    maxPrice,
    inStock,
    outOfStock,
  } = filters;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Build AND conditions array to avoid OR key conflicts
  const andConditions: Prisma.ProductWhereInput[] = [];

  // Search query - OR condition for name/description
  if (query) {
    andConditions.push({
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
    });
  }

  // Stock availability filter - OR condition for out of stock
  if (inStock && !outOfStock) {
    andConditions.push({
      inventory: {
        quantity: {
          gt: 0,
        },
      },
    });
  } else if (outOfStock && !inStock) {
    andConditions.push({
      OR: [
        {
          inventory: {
            quantity: {
              lte: 0,
            },
          },
        },
        {
          inventory: null,
        },
      ],
    });
  }

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    active: true,

    // Combine OR conditions using AND
    ...(andConditions.length > 0 && { AND: andConditions }),

    // Category/Featured/New/Best Sellers filter
    ...(filter === "featured"
      ? { isFeatured: true }
      : filter === "new"
        ? {
            createdAt: {
              gte: thirtyDaysAgo,
            },
          }
        : filter === "best-sellers"
          ? {
              orderItems: {
                some: {},
              },
            }
          : filter
            ? {
                category: {
                  slug: filter,
                },
              }
            : {}),

    // Size filter - product must have at least one of the selected sizes
    ...(sizes &&
      sizes.length > 0 && {
        sizes: {
          hasSome: sizes,
        },
      }),

    // Color filter - product must have at least one of the selected colors
    ...(colors &&
      colors.length > 0 && {
        colors: {
          hasSome: colors,
        },
      }),

    // Tags filter - product must have at least one of the selected tags
    ...(tags &&
      tags.length > 0 && {
        tags: {
          hasSome: tags,
        },
      }),

    // Collections filter - product collection must match one of the selected collections
    ...(collections &&
      collections.length > 0 && {
        collection: {
          in: collections,
        },
      }),

    // Price filter
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      inventory: true,
    },
    orderBy:
      filter === "best-sellers"
        ? {
            orderItems: {
              _count: "desc", // sort best sellers by sales volume
            },
          }
        : { createdAt: "desc" },
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
      sizes: true,
      colors: true,
      tags: true,
      collection: true,
      inventory: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug },
    include: {
      inventory: true,
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
