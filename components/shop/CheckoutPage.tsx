"use client";

import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { product1, product2 } from "@/public/assets/images/images";

export default function Checkout() {
  const [activeStep, setActiveStep] = useState("INFORMATION");

  const orderItems = [
    {
      id: 1,
      name: "Basic Heavy T-Shirt",
      size: "Black/L",
      quantity: 1,
      price: 9.99,
      image: product1,
    },
    {
      id: 2,
      name: "Basic Fit T-Shirt",
      size: "Black/L",
      quantity: 1,
      price: 9.99,
      image: product2,
    },
  ];

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Title */}
        <h1 className="text-4xl font-black tracking-tight text-black mb-8">
          CHECKOUT
        </h1>

        {/* Steps */}
        <div className="flex items-center gap-8 mb-12">
          <button
            onClick={() => setActiveStep("INFORMATION")}
            className={`text-sm font-semibold tracking-wide ${
              activeStep === "INFORMATION" ? "text-black" : "text-neutral-400"
            }`}
          >
            INFORMATION
          </button>
          <button
            onClick={() => setActiveStep("SHIPPING")}
            className={`text-sm font-semibold tracking-wide ${
              activeStep === "SHIPPING" ? "text-black" : "text-neutral-400"
            }`}
          >
            SHIPPING
          </button>
          <button
            onClick={() => setActiveStep("PAYMENT")}
            className={`text-sm font-semibold tracking-wide ${
              activeStep === "PAYMENT" ? "text-black" : "text-neutral-400"
            }`}
          >
            PAYMENT
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-black mb-4">
                CONTACT INFO
              </h2>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-black mb-4">
                SHIPPING ADDRESS
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-neutral-600 focus:outline-none focus:border-black">
                    <option>Country</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
                </div>
                <input
                  type="text"
                  placeholder="State / Region"
                  className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="Address"
                  className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="w-full border-2 border-neutral-300 bg-neutral-100 px-4 py-3 text-sm text-black placeholder:text-neutral-600 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Button */}
            <div className="flex justify-end">
              <button className="flex items-center justify-between w-1/2 bg-neutral-200 hover:bg-neutral-300 px-6 py-4 text-sm font-medium text-black transition-colors">
                <span>Shipping</span>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-neutral-100 border-2 border-neutral-300 p-8 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold tracking-wide text-black">
                YOUR ORDER
              </h2>
              <span className="text-sm text-black">(2)</span>
            </div>

            {/* Order Items */}
            <div className="space-y-6 mb-8">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-28 w-24 shrink-0 bg-neutral-100 border-2 border-neutral-300">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-black">
                            {item.name}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-1">
                            {item.size}
                          </p>
                        </div>
                        <button className="text-xs text-black hover:underline">
                          Change
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">
                        ({item.quantity})
                      </span>
                      <span className="text-sm font-medium text-black">
                        $ {item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 mb-6"></div>

            {/* Subtotal */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Subtotal</span>
              <span className="text-sm font-medium text-black">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-black">Shipping</span>
              <span className="text-xs text-neutral-400">
                Calculated at next step
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200 mb-6"></div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-black">Total</span>
              <span className="text-lg font-bold text-black">
                ${subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
