"use server";
import prisma from "@/lib/prisma";

export async function getProducts() {
  // Add get products logic here
  return prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      image: true,
      active: true,
    },
    orderBy: { createdAt: "desc" },
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
