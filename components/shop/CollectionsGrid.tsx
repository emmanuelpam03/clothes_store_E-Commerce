"use client";

import Image from "next/image";
import { ChevronDown, Heart } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// fallback image
import { whiteShirt1 } from "@/public/assets/images/images";

type CollectionsGridProps = {
  products: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number; // cents
    image: string | null;
    active: boolean;
  }[];
};

export function CollectionsGrid({ products }: CollectionsGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-5">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none">
            XIV <br /> COLLECTIONS <br /> 23–24
          </h1>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-4 text-sm text-neutral-500">
            <div className="flex gap-6">
              <button className="text-black">(ALL)</button>
              <button>Men</button>
              <button>Women</button>
              <button>Kid</button>
            </div>

            <div className="flex gap-12">
              <span className="text-black">Filters (+)</span>
              <div>
                <p className="text-black">Sorts (-)</p>
                <p>Less to more</p>
                <p>More to less</p>
              </div>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              className="w-full"
            >
              {/* IMAGE */}
              <div className="relative h-80 md:h-[520px] bg-white group">
                <Image
                  src={product.image ?? whiteShirt1}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* FAVORITE */}
                <button
                  onClick={(e) => toggleFavorite(product.id, e)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.has(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-black"
                    }`}
                  />
                </button>

                {/* ADD */}
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm">
                  +
                </button>
              </div>

              {/* META */}
              <div className="mt-4 flex justify-between text-sm">
                <p className="font-medium">{product.name}</p>
                <p className="font-semibold">
                  ${(product.price / 100).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* MORE */}
        <div className="mt-16 flex flex-col items-center text-sm text-neutral-500">
          <span>More</span>
          <ChevronDown className="w-12 h-7 text-black" />
        </div>
      </div>
    </section>
  );
}
