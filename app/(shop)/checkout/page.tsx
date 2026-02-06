"use client";

import { useCart } from "@/lib/cart/cart";
import { redirect } from "next/navigation";
import Checkout from "@/components/shop/CheckoutPage";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    toast.error("Your cart is empty. Please add items to proceed to checkout.");
    redirect("/cart");
  }

  return (
    <div>
      <Checkout />
    </div>
  );
}
