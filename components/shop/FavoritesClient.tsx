"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  description: string | null;
};

type FavoritesClientProps = {
  products?: Product[];
  isGuest?: boolean;
};

export default function FavoritesClient({
  products: initialProducts = [],
  isGuest = false,
}: FavoritesClientProps) {
  const [items, setItems] = useState<Product[]>(initialProducts);
  const { toggleFavorite, getGuestFavoriteIds, isLoading } = useFavorites();

  // sync for logged-in users
  useEffect(() => {
    if (!isGuest) {
      setItems(initialProducts);
    }
  }, [initialProducts, isGuest]);

  // load guest favorites
  useEffect(() => {
    if (!isGuest) return;

    const ids = getGuestFavoriteIds();
    if (ids.length === 0) {
      setItems([]);
      return;
    }

    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then(setItems)
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

  const handleRemoveFavorite = async (product: Product) => {
    // optimistic remove
    setItems((prev) => prev.filter((p) => p.id !== product.id));

    const undo = () => {
      setItems((prev) => [product, ...prev]);
    };

    toast("Removed from favorites", {
      action: {
        label: "Undo",
        onClick: undo,
      },
    });

    try {
      await toggleFavorite(product.id);
    } catch {
      undo();
      toast.error("Failed to remove favorite");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">MY FAVORITES</h1>
        <p className="text-neutral-600 mb-12">
          {items.length} item{items.length !== 1 ? "s" : ""} saved
        </p>

        {items.length === 0 ? (
          <div className="bg-white border p-12 text-center">
            <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-xl font-bold mb-2">No favorites yet</p>
            <Link href="/products">
              <button className="bg-black text-white px-8 py-3 uppercase text-sm">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <div
                key={product.id}
                className="bg-white border overflow-hidden"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-96 bg-neutral-50">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-300">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-xl font-bold mb-6">
                    ${(product.price / 100).toFixed(2)}
                  </p>

                  <div className="flex gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1"
                    >
                      <button className="w-full bg-black text-white py-3 uppercase text-xs">
                        View
                      </button>
                    </Link>

                    <button
                      onClick={() => handleRemoveFavorite(product)}
                      disabled={isLoading}
                      className="border px-4"
                      title="Remove"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
