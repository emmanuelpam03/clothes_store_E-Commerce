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
        <div className="mb-10">
          <div>
            <h1 className="text-5xl font-extrabold leading-none tracking-tight text-black">
              XIV <br /> COLLECTIONS <br /> 23–24
            </h1>
          </div>

          {/* CATEGORIES AND FILTERS ROW */}
          <div className="mt-6 flex items-center justify-between">
            {/* CATEGORIES */}
            <div className="flex gap-6 text-sm text-neutral-500">
              <button className="text-black">(ALL)</button>
              <button>Men</button>
              <button>Women</button>
              <button>Kid</button>
            </div>

            {/* FILTER / SORT */}
            <div className="flex items-center justify-center gap-32 text-sm text-neutral-500">
              <p className="tex-black">Filters (+)</p>
              <div>
                <p className="mt-2 text-black">Sorts (-)</p>
                <p className="mt-2">Less to more</p>
                <p>More to Less</p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <div key={i} className="w-full">
              {/* IMAGE CARD */}
              <div className="relative h-[420px] bg-white">
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
