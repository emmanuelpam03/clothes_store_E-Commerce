"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favorite.actions";
import { toast } from "sonner";

type FavoritesClientProps = {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    description: string | null;
  }[];
};

export default function FavoritesClient({ products }: FavoritesClientProps) {
  const [items, setItems] = useState(products);
  const [isPending, startTransition] = useTransition();

  const handleRemoveFavorite = (productId: string) => {
    startTransition(async () => {
      try {
        await toggleFavorite(productId);
        setItems((prev) => prev.filter((item) => item.id !== productId));
        toast.success("Removed from favorites");
      } catch (error) {
        toast.error("Failed to remove from favorites");
        console.error(error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-2">MY FAVORITES</h1>
        <p className="text-neutral-600 mb-12">
          {items.length} item{items.length !== 1 ? "s" : ""} saved
        </p>

        {items.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-12 text-center">
            <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-2xl font-bold text-neutral-700 mb-2">
              No favorites yet
            </p>
            <p className="text-neutral-500 mb-8">
              Start adding items to your wishlist
            </p>
            <Link href="/products">
              <button className="bg-black text-white px-8 py-3 uppercase text-sm font-semibold hover:bg-neutral-800 transition cursor-pointer">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* GRID VIEW */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              {items.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition"
                >
                  {/* IMAGE */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative h-96 bg-neutral-50 overflow-hidden group">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* CONTENT */}
                  <div className="p-6">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold text-black mb-2 hover:underline">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <p className="text-2xl font-bold text-black mb-6">
                      ${(product.price / 100).toFixed(2)}
                    </p>

                    <div className="flex gap-3">
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1"
                      >
                        <button className="w-full bg-black text-white py-3 uppercase text-xs font-semibold hover:bg-neutral-800 transition">
                          View Product
                        </button>
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(product.id)}
                        disabled={isPending}
                        className="px-4 py-3 border border-neutral-300 text-black hover:bg-red-50 hover:border-red-300 transition disabled:opacity-50"
                        title="Remove from favorites"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <button className="bg-neutral-300 text-black px-8 py-3 uppercase text-sm font-semibold hover:bg-neutral-400 transition">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/cart">
                <button className="bg-black text-white px-8 py-3 uppercase text-sm font-semibold hover:bg-neutral-800 transition">
                  Go to Cart
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
