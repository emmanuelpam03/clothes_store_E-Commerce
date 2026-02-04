"use server";

import prisma from "@/lib/prisma";

export async function addToCartAction(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId, active: true },
  });

  if (!product) {
    throw new Error("Product not available");
  }

  return {
    id: product.id,
    title: product.name,
    subtitle: product.description ?? "",
    price: product.price,
    image: product.image,
    size: "L",            // default for now
    color: "#111827",     // default for now
    qty: 1,
  };
}

export async function removeFromCart() {
  // Add remove from cart logic here
}

export async function updateCartItem() {
  // Add update cart item logic here
}

export async function getCart() {
  // Add get cart logic here
}

export async function clearCart() {
  // Add clear cart logic here
}
