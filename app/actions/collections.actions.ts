"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function getCollections() {
  const collections = await prisma.collection.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    productCount: collection._count.products,
  }));
}

export async function createCollectionAdmin(input: {
  name: string;
  slug?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error("Name is required");
  }
  if (name.length > 60) {
    throw new Error("Name is too long");
  }

  const slug = slugify(input.slug?.trim() || name, { maxLength: 80 });
  if (!slug) {
    throw new Error("Slug is required");
  }
  if (slug.length > 80) {
    throw new Error("Slug is too long");
  }

  try {
    const created = await prisma.collection.create({
      data: { name, slug },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      collection: { ...created, productCount: 0 },
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const targets = (() => {
        const meta = err.meta;
        if (!meta || typeof meta !== "object") return [] as string[];
        if (!("target" in meta)) return [] as string[];
        const target = (meta as { target?: unknown }).target;
        if (Array.isArray(target)) {
          return target.filter((t): t is string => typeof t === "string");
        }
        if (typeof target === "string") return [target];
        return [] as string[];
      })();

      if (targets.includes("slug")) {
        return {
          success: false as const,
          error: "Collection slug already exists",
        };
      }
      if (targets.includes("name")) {
        return {
          success: false as const,
          error: "Collection name already exists",
        };
      }

      return { success: false as const, error: "Collection already exists" };
    }

    throw err;
  }
}

export async function updateCollectionAdmin(input: {
  id: string;
  name: string;
  slug?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!input.id) {
    throw new Error("Collection id is required");
  }

  const name = input.name.trim();
  if (!name) {
    throw new Error("Name is required");
  }
  if (name.length > 60) {
    throw new Error("Name is too long");
  }

  const slug = slugify(input.slug?.trim() || name, { maxLength: 80 });
  if (!slug) {
    throw new Error("Slug is required");
  }
  if (slug.length > 80) {
    throw new Error("Slug is too long");
  }

  try {
    const updated = await prisma.collection.update({
      where: { id: input.id },
      data: { name, slug },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    revalidatePath("/admin/collections");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      collection: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        productCount: updated._count.products,
      },
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const targets = (() => {
        const meta = err.meta;
        if (!meta || typeof meta !== "object") return [] as string[];
        if (!("target" in meta)) return [] as string[];
        const target = (meta as { target?: unknown }).target;
        if (Array.isArray(target)) {
          return target.filter((t): t is string => typeof t === "string");
        }
        if (typeof target === "string") return [target];
        return [] as string[];
      })();

      if (targets.includes("slug")) {
        return {
          success: false as const,
          error: "Collection slug already exists",
        };
      }
      if (targets.includes("name")) {
        return {
          success: false as const,
          error: "Collection name already exists",
        };
      }

      return { success: false as const, error: "Collection already exists" };
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return { success: false as const, error: "Collection not found" };
    }

    throw err;
  }
}

export async function deleteCollectionAdmin(collectionId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!collectionId) {
    return { success: false as const, error: "Collection id is required" };
  }

  const count = await prisma.product.count({
    where: { collectionId },
  });

  try {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { collectionId },
        data: { collectionId: null },
      }),
      prisma.collection.delete({
        where: { id: collectionId },
      }),
    ]);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Record to delete does not exist.
      if (err.code === "P2025") {
        return {
          success: false as const,
          error: "Collection not found",
          productCount: 0,
        };
      }
    }
    throw err;
  }

  revalidatePath("/admin/collections");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true as const, productCount: count };
}
