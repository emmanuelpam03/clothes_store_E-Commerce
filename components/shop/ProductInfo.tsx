"use client";

import Image from "next/image";
import { useState } from "react";
import {
  product1,
  product2,
  product3,
  product4,
  product5,
} from "@/public/assets/images/images";

const IMAGES = [product1, product2, product3, product4, product5];
const COLORS = [
  "#e5e7eb",
  "#9ca3af",
  "#111827",
  "#6ee7b7",
  "#ffffff",
  "#c7d2fe",
];
const SIZES = ["XS", "S", "M", "L", "XL", "2X"];

export default function ProductPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 md:px-10 lg:flex lg:items-center lg:justify-center">
      <div className="w-full mx-auto max-w-7xl">
        <div
          className="
          grid gap-10
          lg:grid-cols-[420px_70px_380px] justify-center items-center
        "
        >
          {/* IMAGE + THUMBS (MOBILE/TABLET STACKED) */}
          <div className="flex flex-col md:flex-row gap-6 lg:col-span-2">
            {/* MAIN IMAGE */}
            <div
              className="
              relative bg-white border border-neutral-200
              w-full md:w-[420px]
              aspect-4/5
            "
            >
              <Image
                src={IMAGES[activeImage]}
                alt="Product"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* THUMBNAILS */}
            <div
              className="
              flex md:flex-col gap-3
              overflow-x-auto md:overflow-visible
            "
            >
              {IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-14 border shrink-0 transition cursor-pointer ${
                    activeImage === i
                      ? "border-black"
                      : "border-neutral-200 opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div
            className="
            border border-neutral-200 bg-[#f3f3f3]
            px-6 py-8
            flex flex-col justify-between
          "
          >
            <div>
              <h1 className="text-black text-sm uppercase tracking-wide font-medium">
                Abstract Print Shirt
              </h1>

              <p className="mt-2 text-sm">$99</p>
              <p className="text-xs text-neutral-500">MRP incl. of all taxes</p>

              <p className="mt-6 text-sm leading-relaxed text-neutral-700">
                Relaxed-fit shirt. Camp collar and short sleeves. Button-up
                front.
              </p>

              {/* COLOR */}
              <div className="mt-8">
                <p className="mb-2 text-xs uppercase text-neutral-600">Color</p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveColor(i)}
                      className={`h-6 w-6 border transition cursor-pointer ${
                        activeColor === i
                          ? "border-black ring-1 ring-black"
                          : "border-neutral-300"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div className="mt-8">
                <p className="mb-2 text-xs uppercase text-neutral-600">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setActiveSize(s)}
                      className={`h-8 w-8 text-xs border transition cursor-pointer ${
                        activeSize === s
                          ? "border-black text-black"
                          : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-neutral-500 uppercase">
                  Find your size | Measurement guide
                </p>
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              disabled={!activeSize || activeColor === null}
              className="
                mt-8 w-full bg-neutral-300 text-black py-3
                text-xs uppercase tracking-wide
                disabled:opacity-60
                cursor-pointer
              "
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
