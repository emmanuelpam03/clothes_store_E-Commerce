"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import {
  product1,
  product2,
  product3,
  product4,
} from "@/public/assets/images/images";

const IMAGES: StaticImageData[] = [
  product1,
  product2,
  product3,
  product4,
];

const COLORS = ["#e5e7eb", "#9ca3af", "#6ee7b7", "#c7d2fe"];
const SIZES = ["XS", "S", "M", "L", "XL", "2X"];

export default function ProductInfo() {
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-12 gap-14 items-start">

      {/* LEFT SIDE */}
      <div className="col-span-12 lg:col-span-7 flex justify-center">
        <div className="flex gap-6">

          {/* MAIN IMAGE */}
          <div className="relative h-[520px] w-[420px] bg-neutral-50">
            <Image
              src={IMAGES[activeImage]}
              alt="Product"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* THUMBNAILS (RIGHT SIDE, vertical) */}
          <div className="flex flex-col gap-4">
            {IMAGES.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-16 ${
                  activeImage === i
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={img}
                  alt={`thumb-${i}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="col-span-12 lg:col-span-5 bg-neutral-100 px-6 py-8">

        <h1 className="text-lg font-medium tracking-tight text-black">
          ABSTRACT PRINT SHIRT
        </h1>

        <p className="mt-2 text-sm font-medium text-black">$99</p>
        <p className="text-xs text-neutral-500">
          MRP incl. of all taxes
        </p>

        <p className="mt-6 text-sm text-neutral-700 leading-relaxed max-w-sm">
          Relaxed-fit shirt. Camp collar and short sleeves.
          Button-up front.
        </p>

        {/* COLOR */}
        <div className="mt-8">
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-600">
            Color
          </p>
          <div className="flex gap-3">
            {COLORS.map((color, i) => (
              <div
                key={i}
                className="h-6 w-6"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* SIZE */}
        <div className="mt-8">
          <p className="mb-2 text-xs uppercase tracking-wide text-neutral-600">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setActiveSize(size)}
                className={`h-9 w-9 text-xs border ${
                  activeSize === size
                    ? "border-black text-black"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-neutral-500">
            FIND YOUR SIZE | MEASUREMENT GUIDE
          </p>
        </div>

        {/* ADD BUTTON */}
        <button
          disabled={!activeSize}
          className="mt-10 w-full bg-neutral-200 py-3 text-sm text-neutral-700 disabled:opacity-60"
        >
          ADD
        </button>
      </div>
    </div>
  );
}
