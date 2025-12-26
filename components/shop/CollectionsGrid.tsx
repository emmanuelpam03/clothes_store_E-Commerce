"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import {
  whiteShirt1,
  whiteShirt6,
  soldierShirt,
} from "@/public/assets/images/images";
import { ChevronDown } from "lucide-react";

type Product = {
  image: StaticImageData;
  category: string;
  name: string;
  price: string;
};

const PRODUCTS: Product[] = [
  {
    image: whiteShirt6,
    category: "Cotton T-Shirt",
    name: "Basic Heavy Weight T-Shirt",
    price: "$199",
  },
  {
    image: whiteShirt1,
    category: "Cotton Jeans",
    name: "Soft Wash Straight Fit Jeans",
    price: "$199",
  },
  {
    image: soldierShirt,
    category: "Cotton T-Shirt",
    name: "Basic Heavy Weight T-Shirt",
    price: "$199",
  },
];

export function CollectionsGrid() {
  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-5">
        {/* HEADER */}
        <div className="mb-8 sm:mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight text-black">
              XIV <br /> COLLECTIONS <br /> 23–24
            </h1>
          </div>

          {/* CATEGORIES AND FILTERS ROW */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* CATEGORIES */}
            <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-500 overflow-x-auto">
              <button className="text-black whitespace-nowrap">(ALL)</button>
              <button className="whitespace-nowrap">Men</button>
              <button className="whitespace-nowrap">Women</button>
              <button className="whitespace-nowrap">Kid</button>
            </div>

            {/* FILTER / SORT */}
            <div className="flex items-start sm:items-center gap-6 sm:gap-32 text-xs sm:text-sm text-neutral-500">
              <p className="text-black">Filters (+)</p>
              <div>
                <p className="mt-0 sm:mt-2 text-black">Sorts (-)</p>
                <p className="mt-1 sm:mt-2">Less to more</p>
                <p>More to Less</p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <div key={i} className="w-full">
              {/* IMAGE CARD */}
              <div className="relative h-[300px] sm:h-[360px] md:h-[420px] bg-white">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* ADD */}
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 text-lg text-neutral-600">
                  +
                </button>
              </div>

              {/* META */}
              <div className="mt-4 flex items-center justify-between text-sm text-black">
                <div>
                  <p className="text-neutral-500">{product.category}</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <p className="font-semibold">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* MORE */}
        <div className="mt-16 flex flex-col items-center justify-center text-sm text-neutral-500">
          <span>More</span>
          <span className="-mt-1.5 text-black">
            <ChevronDown className="w-12 h-7" />
          </span>
        </div>
      </div>
    </section>
  );
}
