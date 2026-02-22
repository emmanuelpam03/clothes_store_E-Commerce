"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { CartItem as UICartItem } from "@/lib/cart/cart.types";

/* =========================
   INTERNAL HELPER
========================= */
async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/* =========================
   CART READ / CREATE
========================= */
export async function getOrCreateCart() {
  const userId = await getUserId();

  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

/* =========================
   ADD ITEM
========================= */
export async function addToCartAction(
  productId: string,
  qty = 1,
  size = "M",
  color = "",
) {
  const cart = await getOrCreateCart();

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: { increment: qty },
      size,
      color,
    },
    create: {
      cartId: cart.id,
      productId,
      quantity: qty,
      size,
      color,
    },
  });

  return getOrCreateCart();
}

/* =========================
   REMOVE ITEM
========================= */
export async function removeFromCart(productId: string) {
  const cart = await getOrCreateCart();

  await prisma.cartItem.delete({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  return getOrCreateCart();
}

/* =========================
   UPDATE QTY
========================= */
export async function updateCartQtyAction(productId: string, quantity: number) {
  const cart = await getOrCreateCart();

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });
    return;
  }

  await prisma.cartItem.update({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    data: { quantity },
  });
}

/* =========================
   CLEAR CART
========================= */
export async function clearCart() {
  const cart = await getOrCreateCart();

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return true;
}

/* =========================
   MERGE GUEST CART
========================= */
export async function mergeGuestCartAction(guestItems: UICartItem[]) {
  const cart = await getOrCreateCart();

  for (const item of guestItems) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: item.id,
        },
      },
      update: {
        quantity: { increment: item.qty },
        size: item.size,
        color: item.color,
      },
      create: {
        cartId: cart.id,
        productId: item.id,
        quantity: item.qty,
        size: item.size,
        color: item.color,
      },
    });
  }

  return getOrCreateCart();
}
