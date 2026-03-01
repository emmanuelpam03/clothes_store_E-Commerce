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
  // Use transaction to prevent TOCTOU race conditions
  await prisma.$transaction(async (tx) => {
    // Check product stock within transaction
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.inventory) {
      throw new Error("Product inventory not available");
    }

    // Get or create cart within transaction
    const userId = await getUserId();
    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    // Check existing cart item within transaction
    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId_size_color: {
          cartId: cart.id,
          productId,
          size,
          color,
        },
      },
    });

    // Recalculate quantities inside transaction
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQtyInCart + qty;

    if (product.inventory.quantity < newTotalQty) {
      throw new Error(
        `Only ${product.inventory.quantity} item(s) available. You already have ${currentQtyInCart} in your cart.`,
      );
    }

    // Perform upsert within transaction
    await tx.cartItem.upsert({
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
  const userId = await getUserId();

  if (quantity <= 0) {
    // Verify ownership before deletion
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (cartItem.cart.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });
    return;
  }

  // Use transaction to prevent TOCTOU race conditions
  await prisma.$transaction(async (tx) => {
    // Check stock within transaction and verify ownership
    const cartItem = await tx.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: {
          include: { inventory: true },
        },
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Verify ownership
    if (cartItem.cart.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (!cartItem.product.inventory) {
      throw new Error("Product inventory not available");
    }

    // Validate stock within transaction
    if (cartItem.product.inventory.quantity < quantity) {
      throw new Error(
        `Only ${cartItem.product.inventory.quantity} item(s) available`,
      );
    }

    // Update within transaction
    await tx.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: { quantity },
    });
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
