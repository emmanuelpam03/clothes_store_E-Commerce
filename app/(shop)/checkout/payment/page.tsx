"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
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
            onClick={() => {
              // TEMP: later this will create an order
              alert("Payment on Delivery selected");
            }}
            className="w-full bg-black text-white px-6 py-4 text-sm font-medium cursor-pointer"
          >
            Pay on Delivery
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
