"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/cart";

const CLEAR_CART_AFTER_ORDER_KEY = "clear-cart-after-order";

export default function ClearCartAfterOrder({ orderId }: { orderId: string }) {
  const { clearCart } = useCart();

  useEffect(() => {
    try {
      const pendingOrderId = sessionStorage.getItem(CLEAR_CART_AFTER_ORDER_KEY);
      if (!pendingOrderId || pendingOrderId !== orderId) return;

      clearCart();
      sessionStorage.removeItem(CLEAR_CART_AFTER_ORDER_KEY);
    } catch {
      // Ignore storage errors (private mode, disabled storage, etc.)
    }
  }, [clearCart, orderId]);

  return null;
}
