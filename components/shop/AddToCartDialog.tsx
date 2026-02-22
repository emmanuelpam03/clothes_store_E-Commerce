"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/cart";
import { addToCartAction } from "@/app/actions/cart.actions";
import { useSession } from "next-auth/react";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2X"];

const COLOR_MAP: Record<string, string> = {
  Black: "#111827",
  White: "#ffffff",
  Gray: "#9ca3af",
  Grey: "#9ca3af",
  Blue: "#3b82f6",
  Navy: "#1e3a8a",
  Red: "#ef4444",
  Burgundy: "#7f1d1d",
  Green: "#22c55e",
  Pink: "#ec4899",
  Purple: "#a855f7",
  Yellow: "#facc15",
  Orange: "#f97316",
  Brown: "#92400e",
  Beige: "#d6d3d1",
  Cream: "#fef3c7",
};

const DEFAULT_COLORS = Object.keys(COLOR_MAP);

/**
 * Get a valid CSS color value from a color name.
 * Returns the mapped color if found in COLOR_MAP,
 * or the color if it's a valid hex value,
 * otherwise defaults to a neutral gray.
 */
const getColorValue = (color: string): string => {
  // Normalize input: trim whitespace and convert to lowercase for lookup
  const normalizedColor = color.trim();

  // Check if color exists in COLOR_MAP (case-insensitive lookup)
  const colorMapEntry = Object.entries(COLOR_MAP).find(
    ([key]) => key.toLowerCase() === normalizedColor.toLowerCase(),
  );

  if (colorMapEntry) {
    return colorMapEntry[1];
  }

  // Check if it's a valid hex color (3 or 6 digit hex code)
  const hexColorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  if (hexColorRegex.test(normalizedColor)) {
    return normalizedColor;
  }

  // Default to neutral gray for invalid colors
  return "#d4d4d4";
};

type Product = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  sizes?: string[];
  colors?: string[];
};

type Props = {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
};

export default function AddToCartDialog({ product, isOpen, onClose }: Props) {
  const { addItem, hydrateFromDb } = useCart();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const sizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;

  const colors =
    product.colors && product.colors.length > 0
      ? product.colors
      : DEFAULT_COLORS;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      setSelectedColor(null);
      setQty(1);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }

    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor}`, // Unique ID for guest cart
      productId: product.id,
      title: product.name,
      subtitle: product.name,
      price: product.price / 100,
      image: product.image ?? "/placeholder.png",
      size: selectedSize,
      color: selectedColor,
      qty,
    };

    setIsLoading(true);
    try {
      if (isLoggedIn) {
        await addToCartAction(product.id, qty, selectedSize, selectedColor);
        await hydrateFromDb(); // Get real IDs from DB
      } else {
        addItem(cartItem); // Guest users use fake IDs
      }
      toast.success("Added to cart!");
      onClose();
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-white shadow-xl p-6">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-neutral-100 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-black" />
        </button>

        {/* product summary */}
        <div className="flex gap-4 mb-6">
          <div className="relative h-20 w-14 shrink-0 bg-neutral-100">
            <Image
              src={product.image ?? "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-black leading-snug">
              {product.name}
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              ${(product.price / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* size */}
        <div className="mb-5">
          <p className="text-xs uppercase text-neutral-500 mb-2">
            Size{selectedSize && `: ${selectedSize}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-8 w-9 text-xs border transition ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* color */}
        <div className="mb-5">
          <p className="text-xs uppercase text-neutral-500 mb-2">
            Color{selectedColor && `: ${selectedColor}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className={`h-7 w-7 border-2 transition-transform ${
                  selectedColor === color
                    ? "border-black scale-110 ring-1 ring-black ring-offset-1"
                    : "border-neutral-200 hover:scale-105"
                }`}
                style={{ backgroundColor: getColorValue(color) }}
              />
            ))}
          </div>
        </div>

        {/* qty */}
        <div className="mb-6 flex items-center gap-3">
          <p className="text-xs uppercase text-neutral-500">Qty</p>
          <div className="flex items-center border border-neutral-300">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-1 text-sm hover:bg-neutral-100 transition"
            >
              −
            </button>
            <span className="px-4 py-1 text-sm border-x border-neutral-300">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-3 py-1 text-sm hover:bg-neutral-100 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* add button */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize || !selectedColor || isLoading}
          className="w-full bg-black text-white py-3 text-xs uppercase tracking-wide hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
