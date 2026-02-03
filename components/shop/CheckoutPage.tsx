"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

export default function Checkout() {
  const [activeStep] = useState("INFORMATION");
  const router = useRouter();
  const { items } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8">CHECKOUT</h1>

        {/* STEPS */}
        <div className="flex gap-8 mb-12">
          <span className="text-black">INFORMATION</span>
          <span className="text-neutral-400">SHIPPING</span>
          <span className="text-neutral-400">PAYMENT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT — INFORMATION (NOT REMOVED) */}
          <div className="space-y-8">
            <h2 className="text-sm font-semibold">CONTACT INFO</h2>
            <input placeholder="Email" className="w-full border px-4 py-3" />
            <input placeholder="Phone" className="w-full border px-4 py-3" />

            <h2 className="text-sm font-semibold">SHIPPING ADDRESS</h2>

            <input placeholder="First Name" className="w-full border px-4 py-3" />
            <input placeholder="Last Name" className="w-full border px-4 py-3" />
            <input placeholder="Address" className="w-full border px-4 py-3" />

            <button
              onClick={() => router.push("/checkout/payment")}
              className="bg-neutral-200 px-6 py-4 flex justify-between"
            >
              <span>Payment</span>
              <ArrowLeft className="rotate-180" />
            </button>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="border p-8">
            <h2 className="text-sm mb-6">YOUR ORDER</h2>

            {items.map((item) => (
              <div key={item.id} className="flex gap-4 mb-4">
                <Image src={item.image} alt={item.title} width={96} height={96} />
                <div className="flex-1">
                  <p>{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.subtitle}</p>
                </div>
                <span>${item.price}</span>
              </div>
            ))}

            <div className="border-t mt-6 pt-4 flex justify-between">
              <span>Total</span>
              <span>${subtotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
