"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

function slugifyCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

  const slug = slugifyCategory(input.slug?.trim() || name);
  if (!slug) {
    throw new Error("Slug is required");
  }
  if (slug.length > 80) {
    throw new Error("Slug is too long");
  }

  const created = await prisma.category.create({
    data: { name, slug },
  });

  return { success: true, category: created };
}

export async function deleteCategoryAdmin(categoryId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!categoryId) {
    throw new Error("Category id is required");
  }

  // Prevent deletion if there are products attached.
  const count = await prisma.product.count({
    where: { categoryId },
  });

  if (count > 0) {
    throw new Error("Cannot delete a category with products");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { success: true };
}
