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

export default function PaymentPage() {
  const { items, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [shippingDetails, setShippingDetails] =
    useState<ShippingDetails | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SHIPPING_DETAILS_KEY);
      if (!raw) {
        toast.error("Please complete checkout first");
        router.replace("/checkout");
        return;
      }
      setShippingDetails(JSON.parse(raw) as ShippingDetails);
    } catch {
      toast.error("Please complete checkout first");
      router.replace("/checkout");
    }
  }, [router]);

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
                clearCart();
                toast.success("Order placed");
                router.push(`/order/${order.id}`);
              } catch (e: any) {
                toast.error(e.message);
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
