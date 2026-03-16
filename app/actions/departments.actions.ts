"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { Prisma } from "@/app/generated/prisma/client";

export async function getDepartments() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
  });
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

    return { success: true as const, department: created };
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
    throw new Error("Cannot delete a department with products");
  }

  await prisma.department.delete({
    where: { id: departmentId },
  });

  return { success: true as const };
}
