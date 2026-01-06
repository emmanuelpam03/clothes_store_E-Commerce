"use client";

import Image from "next/image";
import { useState } from "react";
import { product1, product2 } from "@/public/assets/images/images";

export default function ShoppingBag() {
  const items = [
    {
      id: 1,
      title: "Cotton T Shirt",
      subtitle: "Full Sleeve Zipper",
      price: 99,
      image: product1,
      size: "L",
      color: "#111827",
    },
    {
      id: 2,
      title: "Cotton T Shirt",
      subtitle: "Basic Slim Fit T-Shirt",
      price: 99,
      image: product2,
      size: "L",
      color: "#111827",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-8 py-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">

        {/* LEFT: ITEMS */}
        <div className="flex flex-wrap gap-14">
          {items.map((item) => (
            <div key={item.id} className="w-[300px]">

              {/* IMAGE + SIDE CONTROLS */}
              <div className="flex gap-4">
                {/* IMAGE */}
                <div className="relative w-[220px] h-[300px] border bg-white">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>

                {/* SIDE CONTROLS */}
                <div className="flex flex-col items-center gap-3 text-xs">
                  {/* SIZE */}
                  <div className="border w-6 h-6 flex items-center justify-center">
                    {item.size}
                  </div>

                  {/* COLOR */}
                  <div
                    className="w-4 h-4 border"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* QTY */}
                  <button className="border w-6 h-6">+</button>
                  <span>1</span>
                  <button className="border w-6 h-6">−</button>
                </div>
              </div>

              {/* TEXT BELOW IMAGE */}
              <div className="mt-4 text-sm">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.subtitle}</p>
                <p className="mt-2">${item.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="border bg-[#f3f3f3] p-8 h-fit">
          <h2 className="text-xs uppercase tracking-wide mb-8">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>$180</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>$10</span>
            </div>
          </div>

          <div className="border-t mt-6 pt-6 flex justify-between font-medium">
            <span>Total</span>
            <span>$190</span>
          </div>

          <label className="flex gap-2 text-xs mt-6">
            <input type="checkbox" />
            I agree to the Terms and Conditions
          </label>

          <button className="w-full mt-6 bg-neutral-300 py-3 text-xs uppercase">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
