"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Suspense, useState } from "react";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { toast } from "sonner";

// fallback image
import { whiteShirt1 } from "@/public/assets/images/images";
import { CollectionsGridSkeleton } from "./skeleton/CollectionsGridSkeleton";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // cents
  image: string | null;
  // active: boolean;
};

type CollectionsGridProps = {
  products?: Product[];
};

export function CollectionsGrid({ products = [] }: CollectionsGridProps) {
  const { isFavorited, toggleFavorite, isLoading: isPending } = useFavorites();

  // show products in batches of 6
  const BATCH_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleToggleFavorite = async (
    productId: string,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await toggleFavorite(productId);
      toast.success(
        result.isFavorited
          ? "Added to favorites!"
          : "Removed from favorites",
      );
    } catch {
      toast.error("Failed to update favorites");
    }
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
        <Suspense fallback={<CollectionsGridSkeleton />}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="animate-[fadeInUp_0.35s_ease-out]"
              >
                <Link
                  href={`/products/${product.slug}`}
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
                      onClick={(e) =>
                        handleToggleFavorite(product.id, e)
                      }
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/80"
                      disabled={isPending}
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorited(product.id)
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
              </div>
            ))}
          </div>
        </Suspense>

        {/* MORE / LESS */}
        <div className="mt-16 flex flex-col items-center text-sm text-neutral-500">
          {hasMore ? (
            <button
              onClick={() =>
                setVisibleCount((prev) => prev + BATCH_SIZE)
              }
              className="flex flex-col items-center rounded-full px-6 py-3 hover:text-black transition"
            >
              <span>More</span>
              <ChevronDown className="w-12 h-7 text-black" />
            </button>
          ) : products.length > BATCH_SIZE ? (
            <button
              onClick={() => setVisibleCount(BATCH_SIZE)}
              className="flex flex-col items-center rounded-full px-6 py-3 hover:text-black transition"
            >
              <span>Less</span>
              <ChevronUp className="w-12 h-7 text-black" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
