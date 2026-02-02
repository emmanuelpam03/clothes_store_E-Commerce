"use client";

import { ArrowLeft } from "lucide-react";
import { createOrderAction } from "@/app/actions/order.actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type CartItem = {
  productId: string;
  quantity: number;
};

const cart: CartItem[] = [
  { productId: "cml51rx230006psp7o1prfgdt", quantity: 2 },
  // { productId: "xyz456", quantity: 1 },
];

export default function PaymentPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-neutral-100 border-2 border-neutral-300 p-8">
        <button
          onClick={() => router.push("/checkout")}
          className="flex items-center gap-2 text-sm text-black mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Payment</h1>

        <div className="space-y-4">
          
          {/* Payment on Delivery */}
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const order = await createOrderAction(cart);
                  toast.success("Order placed successfully");
                  router.push(`/order/${order.id}`);
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to place order",
                  );
                }
              })
            }
            className="w-full bg-black text-white px-6 py-4 text-sm font-medium"
          >
            {isPending ? "Processing..." : "Pay on Delivery"}
          </button>

          {/* Card (later Stripe) */}
          <button
            disabled
            className="w-full border-2 border-neutral-300 px-6 py-4 text-sm text-neutral-400 cursor-not-allowed"
          >
            Pay with Card (Coming Soon)
          </button>

          {/* PayPal */}
          <button
            disabled
            className="w-full border-2 border-neutral-300 px-6 py-4 text-sm text-neutral-400 cursor-not-allowed"
          >
            Pay with PayPal (Coming Soon)
          </button>
        </div>

        <p className="text-xs text-neutral-500 mt-6">
          You’ll choose a payment method to complete your order.
        </p>
      </div>
    </div>
  );
}
