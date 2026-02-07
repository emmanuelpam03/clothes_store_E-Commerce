"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/cart";

/**
 * Clears the client cart when the order page mounts.
 * Used after placing an order so we don't clear cart on checkout (which would
 * trigger the "cart is empty" toast/redirect loop).
 */
export default function OrderPageCartClear() {
  const { clearCart, items } = useCart();

  useEffect(() => {
    if (items.length > 0) {
      clearCart();
    }
  }, [clearCart, items.length]);

  return null;
}
