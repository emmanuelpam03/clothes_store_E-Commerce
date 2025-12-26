"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import {
  whiteShirt1,
  whiteShirt2,
  whiteShirt3,
  whiteShirt4,
  whiteShirt5,
} from "@/public/assets/images/images";
import { Search } from "lucide-react";

type Product = {
  image: StaticImageData;
  category: string;
  name: string;
  price: string;
};

const PRODUCTS: Product[] = [
  {
    image: whiteShirt1,
    category: "Cotton T-Shirt",
    name: "Basic Slim Fit T-Shirt",
    price: "$199",
  },
  {
    image: whiteShirt2,
    category: "Crewneck T-Shirt",
    name: "Basic Heavy Weight T-Shirt",
    price: "$199",
  },
  {
    image: whiteShirt3,
    category: "Cotton T-Shirt",
    name: "Full Sleeve Zipper",
    price: "$199",
  },
  {
    image: whiteShirt4,
    category: "Cotton T-Shirt",
    name: "Basic Slim Fit T-Shirt",
    price: "$199",
  },
  {
    image: whiteShirt5,
    category: "Crewneck T-Shirt",
    name: "Basic Heavy Weight T-Shirt",
    price: "$199",
  },
];

const CATEGORIES = [
  "NEW",
  "BEST SELLERS",
  "SHIRTS",
  "T-SHIRTS",
  "POLO SHIRTS",
  "JEANS",
  "JACKETS",
  "SHORTS",
];

export default function ProductsPageComponent() {
  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* BREADCRUMB */}
        <p className="text-xs text-neutral-500">Home / Products</p>

        {/* TITLE */}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-black">
          PRODUCTS
        </h1>

        {/* SEARCH + CATEGORIES */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* SEARCH */}
          <div className="flex w-full max-w-md items-center gap-3 rounded bg-neutral-200 px-4 py-2 text-sm text-black">
            <Search size={16} />
            <input
              placeholder="Search"
              className="w-full bg-transparent outline-none placeholder:text-neutral-500"
            />
          </div>

          {/* CATEGORY PILLS */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="rounded border border-neutral-300 px-3 py-1 text-xs tracking-wide text-black hover:bg-black hover:text-white"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="mt-12 grid grid-cols-12 gap-8">
          {/* FILTER SIDEBAR */}
          <aside className="col-span-12 md:col-span-3 space-y-10">
            {/* SIZE */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-black">Size</h3>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "2X"].map((size) => (
                  <button
                    key={size}
                    className="h-9 w-9 border text-xs text-black hover:bg-black hover:text-white"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* AVAILABILITY */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-black">
                Availability
              </h3>
              <div className="space-y-2 text-sm text-black">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Availability <span className="text-blue-600">(450)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Out of Stock <span className="text-blue-600">(18)</span>
                </label>
              </div>
            </div>

            {/* OTHER FILTER HEADERS */}
            {[
              "Category",
              "Colors",
              "Price Range",
              "Collections",
              "Tags",
              "Ratings",
            ].map((label) => (
              <button
                key={label}
                className="flex w-full items-center justify-between text-sm font-semibold text-black"
              >
                {label}
                <span>›</span>
              </button>
            ))}
          </aside>

          {/* PRODUCTS GRID */}
          <div className="col-span-12 md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PRODUCTS.map((product, i) => (
              <Link key={i} href={`/products/${i}`}>
                <div className="relative h-[420px] bg-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />

                  {/* ADD */}
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm text-black">
                    +
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-black">
                  <div>
                    <p className="text-neutral-500">{product.category}</p>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <p className="font-semibold">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
