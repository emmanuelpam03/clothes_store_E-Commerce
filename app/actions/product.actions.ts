"use server";
import prisma from "@/lib/prisma";

export async function getProducts() {
  // Add get products logic here
}

export async function getProduct(slug: string) {
  // Add get product logic here
}

export async function createProduct() {
  const product = await prisma.product.create({
    data: {
      name: "Basic Heavy T-Shirt",
      description: "Premium cotton t-shirt",
      price: 999, // cents
      active: true,
      inventory: {
        create: {
          quantity: 50,
        },
      },
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
