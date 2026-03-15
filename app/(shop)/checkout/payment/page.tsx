"use client";

import { ArrowLeft } from "lucide-react";
import { createOrderAction } from "@/app/actions/order.actions";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart";

type ShippingDetails = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
};

const SHIPPING_DETAILS_KEY = "checkout-shipping-details";
const CLEAR_CART_AFTER_ORDER_KEY = "clear-cart-after-order";

export default function PaymentPage() {
  const { items } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [shippingDetails] = useState<ShippingDetails | null>(() => {
    try {
      const raw = sessionStorage.getItem(SHIPPING_DETAILS_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ShippingDetails;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (shippingDetails) return;
    toast.error("Please complete checkout first");
    router.replace("/checkout");
  }, [router, shippingDetails]);

  const orderItems = items.map((item) => ({
    productId: item.productId,
    quantity: item.qty,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="max-w-md w-full border p-8">
        <button
          onClick={() => router.push("/checkout")}
          className="mb-6 flex gap-2"
        >
          <ArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                if (!shippingDetails) {
                  toast.error("Please complete checkout first");
                  router.replace("/checkout");
                  return;
                }

                const order = await createOrderAction(
                  orderItems,
                  shippingDetails,
                );
                toast.success("Order placed");

                try {
                  sessionStorage.setItem(
                    CLEAR_CART_AFTER_ORDER_KEY,
                    String(order.id),
                  );
                } catch {
                  // Ignore storage errors
                }

                router.push(`/order/${order.id}`);
              } catch (error: unknown) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Something went wrong",
                );
              }
            })
          }
          className="w-full bg-black text-white py-4"
        >
          {isPending ? "Processing..." : "Pay on Delivery"}
        </button>
      </div>
    </div>
  );
}
