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
      cartId_productId_size_color: {
        cartId: cart.id,
        productId,
        size,
        color,
      },
    },
    update: {
      quantity: { increment: qty },
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
export async function removeFromCart(cartItemId: string) {
  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return getOrCreateCart();
}

/* =========================
   UPDATE QTY
========================= */
export async function updateCartQtyAction(
  cartItemId: string,
  quantity: number,
) {
  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });
    return;
  }

  await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: { quantity },
  });
}

/* =========================
   UPDATE ITEM (SIZE/COLOR)
========================= */
export async function updateCartItemAction(
  cartItemId: string,
  updates: { size?: string; color?: string },
) {
  const userId = await getUserId();

  // Load the target item with its cart to verify ownership
  const targetItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!targetItem) {
    throw new Error("Cart item not found");
  }

  // Verify ownership
  if (targetItem.cart.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // If updating size or color, check for conflicts
  if (updates.size || updates.color) {
    const newSize = updates.size ?? targetItem.size;
    const newColor = updates.color ?? targetItem.color;

    // Check if an item with the new size/color combination already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: targetItem.cartId,
        productId: targetItem.productId,
        size: newSize,
        color: newColor,
        id: { not: cartItemId }, // Exclude the current item
      },
    });

    if (existingItem) {
      // Merge: add current item's quantity to existing item, then delete current
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + targetItem.quantity },
      });

      await prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return; // Operation complete
    }
  }

  // No conflict, safe to update
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: updates,
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
        cartId_productId_size_color: {
          cartId: cart.id,
          productId: item.productId,
          size: item.size,
          color: item.color,
        },
      },
      update: {
        quantity: { increment: item.qty },
      },
      create: {
        cartId: cart.id,
        productId: item.productId,
        quantity: item.qty,
        size: item.size,
        color: item.color,
      },
    });
  }

  return getOrCreateCart();
}
