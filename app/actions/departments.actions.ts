"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return departments.map((department) => ({
    id: department.id,
    name: department.name,
    slug: department.slug,
    productCount: department._count.products,
  }));
}

export async function createDepartmentAdmin(input: {
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
    const created = await prisma.department.create({
      data: { name, slug },
    });

    revalidatePath("/admin/departments");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      department: { ...created, productCount: 0 },
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
          error: "Department slug already exists",
        };
      }
      if (targets.includes("name")) {
        return {
          success: false as const,
          error: "Department name already exists",
        };
      }

      return { success: false as const, error: "Department already exists" };
    }

    throw err;
  }
}

export async function updateDepartmentAdmin(input: {
  id: string;
  name: string;
  slug?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!input.id) {
    throw new Error("Department id is required");
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
    const updated = await prisma.department.update({
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

    revalidatePath("/admin/departments");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true as const,
      department: {
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
          error: "Department slug already exists",
        };
      }
      if (targets.includes("name")) {
        return {
          success: false as const,
          error: "Department name already exists",
        };
      }

      return { success: false as const, error: "Department already exists" };
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return { success: false as const, error: "Department not found" };
    }

    throw err;
  }
}

export async function deleteDepartmentAdmin(departmentId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (!departmentId) {
    throw new Error("Department id is required");
  }

  const count = await prisma.product.count({
    where: { departmentId },
  });

  if (count > 0) {
    return {
      success: false as const,
      error: `Cannot delete department with ${count} product${count === 1 ? "" : "s"}`,
      productCount: count,
    };
  }

  try {
    await prisma.department.delete({
      where: { id: departmentId },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return {
        success: false as const,
        error: "Department not found",
        productCount: 0,
      };
    }
    throw err;
  }

  revalidatePath("/admin/departments");
  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true as const, productCount: 0 };
}
