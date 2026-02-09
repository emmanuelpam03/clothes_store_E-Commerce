"use client";

import { useCart } from "@/lib/cart/cart";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Checkout from "@/components/shop/CheckoutPage";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      toast.error(
        "Your cart is empty. Please add items to proceed to checkout.",
      );
      router.replace("/cart");
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <Checkout />
    </div>
  );
}
