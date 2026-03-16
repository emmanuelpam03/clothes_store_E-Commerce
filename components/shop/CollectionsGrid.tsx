"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Heart, ShoppingBag } from "lucide-react";
import { Suspense, useState } from "react";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { toast } from "sonner";
import AddToCartDialog from "./AddToCartDialog";
import { formatCurrencyFromCentsConverted } from "@/lib/money";
import { useStoreSettings } from "@/lib/store-settings-client";
import { config } from "@/constants/config";

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
  sizes?: string[];
  colors?: string[];
  // active: boolean;
};

type CollectionsGridProps = {
  products?: Product[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export function CollectionsGrid({
  products = [],
  categories,
}: CollectionsGridProps) {
  const { isFavorited, toggleFavorite, isLoading: isPending } = useFavorites();
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);
  const { currency, fxRate } = useStoreSettings();

  const navCategories = (() => {
    const bySlug = new Map(categories.map((c) => [c.slug.toLowerCase(), c]));
    const preferred = ["men", "women", "kids"]
      .map((slug) => bySlug.get(slug))
      .filter(Boolean);
    return preferred.length > 0 ? preferred : categories.slice(0, 3);
  })();

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
        result.isFavorited ? "Added to favorites!" : "Removed from favorites",
      );
    } catch {
      toast.error("Failed to update favorites");
    }
  };

  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none">
            {config.appName} <br /> COLLECTIONS
          </h1>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-4 text-sm text-neutral-500">
            <div className="flex gap-6">
              <Link href="/products" className="text-black">
                (ALL)
              </Link>
              {navCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.slug)}`}
                >
                  {cat.name}
                </Link>
              ))}
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

        <Suspense fallback={<CollectionsGridSkeleton />}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <div
                key={product.id}
                className="animate-[fadeInUp_0.35s_ease-out]"
              >
                <Link href={`/products/${product.slug}`} className="w-full">
                  <div className="relative h-80 md:h-130 bg-white group">
                    <Image
                      src={product.image ?? whiteShirt1}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />

                    <button
                      onClick={(e) => handleToggleFavorite(product.id, e)}
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

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDialogProduct(product);
                      }}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 hover:bg-white p-2 transition-colors"
                      title="Add to cart"
                    >
                      <ShoppingBag className="h-4 w-4 text-black" />
                    </button>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <p className="font-medium">{product.name}</p>
                    <p className="font-semibold">
                      {formatCurrencyFromCentsConverted(
                        product.price,
                        currency,
                        fxRate,
                      )}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </Suspense>

        <div className="mt-16 flex flex-col items-center text-sm text-neutral-500">
          {hasMore ? (
            <button
              onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
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

      {/* ADD TO CART DIALOG */}
      {dialogProduct && (
        <AddToCartDialog
          product={dialogProduct}
          isOpen={!!dialogProduct}
          onClose={() => setDialogProduct(null)}
        />
      )}
    </section>
  );
}
