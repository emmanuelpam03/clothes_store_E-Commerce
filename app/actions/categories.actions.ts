"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category._count.products,
  }));
}

export async function createCategoryAdmin(input: {
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
    const created = await prisma.category.create({
      data: { name, slug },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      category: { ...created, productCount: 0 },
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint violation
      if (err.code === "P2002") {
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
            error: "Category slug already exists",
          };
        }

        if (targets.includes("name")) {
          return {
            success: false as const,
            error: "Category name already exists",
          };
        }

        return { success: false as const, error: "Category already exists" };
      }
    }

    throw err;
  }
}

export async function updateCategoryAdmin(input: {
  id: string;
  name: string;
  slug?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!input.id) {
    throw new Error("Category id is required");
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
    const updated = await prisma.category.update({
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

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        productCount: updated._count.products,
      },
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
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
            error: "Category slug already exists",
          };
        }

        if (targets.includes("name")) {
          return {
            success: false as const,
            error: "Category name already exists",
          };
        }

        return { success: false as const, error: "Category already exists" };
      }

      if (err.code === "P2025") {
        return { success: false as const, error: "Category not found" };
      }
    }

    throw err;
  }
}

export async function deleteCategoryAdmin(categoryId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!categoryId) {
    throw new Error("Category id is required");
  }

  const count = await prisma.product.count({
    where: { categoryId },
  });

  if (count > 0) {
    return {
      success: false as const,
      error: `Cannot delete category with ${count} product${count === 1 ? "" : "s"}`,
      productCount: count,
    };
  }

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return {
        success: false as const,
        error: "Category not found",
        productCount: 0,
      };
    }
    throw err;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true as const, productCount: 0 };
}
