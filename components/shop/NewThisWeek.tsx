"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { toast } from "sonner";

// fallback image (IMPORTANT)
import { whiteShirt1 } from "@/public/assets/images/images";

type NewThisWeekProps = {
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

export function NewThisWeek({ products }: NewThisWeekProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(4);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const { isFavorited, toggleFavorite, isLoading: isPending } = useFavorites();

  const handleToggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await toggleFavorite(productId);
      toast.success(result.isFavorited ? "Added to favorites!" : "Removed from favorites");
    } catch (error) {
      toast.error("Failed to update favorites");
      console.error(error);
    }
  };

  // responsive cards
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(products.length - visible, 0);
  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // drag logic
  const onStart = (x: number) => setDragStart(x);
  const onMove = (x: number) => {
    if (dragStart !== null) setDragOffset(x - dragStart);
  };
  const onEnd = () => {
    if (dragOffset > 80) prev();
    if (dragOffset < -80) next();
    setDragStart(null);
    setDragOffset(0);
  };

  return (
    <section className="w-full bg-neutral-100 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-5">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            NEW <br className="hidden sm:block" /> THIS WEEK
          </h2>
          <Link href="/shop" className="text-xs sm:text-sm hover:underline">
            See All
          </Link>
        </div>

        {/* SLIDER */}
        <div
          className="relative overflow-hidden"
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${
                index * (100 / visible)
              }% + ${dragOffset}px))`,
            }}
          >
            {products.map((product, i) => (
              <Link
                href={`/products/${product.slug}`}
                key={product.id}
                className="shrink-0 pr-4"
                style={{ width: `${100 / visible}%` }}
              >
                {/* CARD */}
                <div className="relative h-72 bg-white overflow-hidden group">
                  <Image
                    src={product.image ?? whiteShirt1}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />

                  {/* FAVORITE */}
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
                </div>

                <div className="mt-3 text-sm">
                  <p className="font-medium">{product.name}</p>
                  <p className="font-semibold">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={prev}
            disabled={index === 0}
            className="h-8 w-8 border disabled:opacity-30"
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={index === maxIndex}
            className="h-8 w-8 border disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
