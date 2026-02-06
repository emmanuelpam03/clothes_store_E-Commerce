"use client";

import Image from "next/image";
import { useState } from "react";

// fallback static images (safe)
import {
  product1,
  product2,
  product3,
  product4,
  product5,
} from "@/public/assets/images/images";

const FALLBACK_IMAGES = [
  product1,
  product2,
  product3,
  product4,
  product5,
];

const COLORS = [
  "#e5e7eb",
  "#9ca3af",
  "#111827",
  "#6ee7b7",
  "#ffffff",
  "#c7d2fe",
];

const SIZES = ["XS", "S", "M", "L", "XL", "2X"];

type ProductInfoProps = {
  // slug: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number; // cents
    image: string | null;
    active: boolean;
  };
};

export default function ProductInfo({ product }: ProductInfoProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<number | null>(null);

  const displayPrice = (product.price / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 md:px-10 lg:flex lg:items-center lg:justify-center">
      <div className="w-full mx-auto max-w-7xl">
        <div
          className="
            grid gap-10
            lg:grid-cols-[420px_70px_380px]
            justify-center items-center
          "
        >
          {/* IMAGE + THUMBNAILS */}
          <div className="flex flex-col md:flex-row gap-6 lg:col-span-2">
            {/* MAIN IMAGE */}
            <div className="relative bg-white border border-neutral-200 w-full md:w-[420px] aspect-[4/5]">
              <Image
                src={product.image ?? FALLBACK_IMAGES[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible">
              {FALLBACK_IMAGES.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-14 border shrink-0 transition ${
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
          <div className="border border-neutral-200 bg-[#f3f3f3] px-6 py-8 flex flex-col justify-between">
            <div>
              <h1 className="text-black text-sm uppercase tracking-wide font-medium">
                {product.name}
              </h1>

              <p className="mt-2 text-sm">${displayPrice}</p>
              <p className="text-xs text-neutral-500">
                MRP incl. of all taxes
              </p>

              {product.description && (
                <p className="mt-6 text-sm leading-relaxed text-neutral-700">
                  {product.description}
                </p>
              )}

              {/* COLOR */}
              <div className="mt-8">
                <p className="mb-2 text-xs uppercase text-neutral-600">
                  Color
                </p>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveColor(i)}
                      className={`h-6 w-6 border transition ${
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
                <p className="mb-2 text-xs uppercase text-neutral-600">
                  Size
                </p>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveSize(size)}
                      className={`h-8 w-8 text-xs border transition ${
                        activeSize === size
                          ? "border-black text-black"
                          : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[11px] text-neutral-500 uppercase">
                  Find your size | Measurement guide
                </p>
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              disabled={!activeSize || activeColor === null}
              className="
                mt-8 w-full bg-neutral-300 text-black py-3
                text-xs uppercase tracking-wide
                disabled:opacity-60
              "
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
