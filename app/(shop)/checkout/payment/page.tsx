"use client";

import { ArrowLeft } from "lucide-react";
import { createOrderAction } from "@/app/actions/order.actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

export default function PaymentPage() {
  const { items, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const orderItems = items.map((item) => ({
    productId: item.id,
    quantity: item.qty,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="max-w-md w-full border p-8">
        <button onClick={() => router.push("/checkout")} className="mb-6 flex gap-2">
          <ArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                const order = await createOrderAction(orderItems);
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
