"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  product1,
  product2,
  favouritesIcon,
} from "@/public/assets/images/images";
import { Heart, XIcon } from "lucide-react";

type CartItem = {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  image: StaticImageData;
  size: string;
  color: string;
  qty: number;
};

export default function ShoppingBag() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      title: "Cotton T Shirt",
      subtitle: "Full Sleeve Zipper",
      price: 99,
      image: product1,
      size: "L",
      color: "#111827",
      qty: 1,
    },
    {
      id: 2,
      title: "Cotton T Shirt",
      subtitle: "Basic Slim Fit T-Shirt",
      price: 99,
      image: product2,
      size: "L",
      color: "#111827",
      qty: 1,
    },
  ]);

  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const updateQty = (id: number, type: "inc" | "dec") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + (type === "inc" ? 1 : -1)) }
          : item
      )
    );
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    setFavorites((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex sm:flex-row justify-center items-center gap-4 uppercase text-black text-xs mb-5 text-center">
          <Link href="/cart">shopping bag</Link>

          <Link href="/favourites" className="flex items-center gap-2">
            <span className="bg-white p-3">
              <Image
                src={favouritesIcon}
                alt="favourites"
                width={13}
                height={13}
              />
            </span>
            <p>favourites</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">
          {/* LEFT — CART ITEMS */}
          <div className="flex flex-wrap gap-12 py-5 border-y border-neutral-300 justify-center">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 w-fit sm:w-[320px] mx-auto"
              >
                {/* IMAGE & TEXT */}
                <div>
                  <div className="relative w-[220px] h-[300px] border bg-white">
                    <Link href={`/products/${item.id}`}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* FAVORITE ICON OVERLAY */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer"
                      aria-label="Add to favourites"
                    >
                      <Heart
                        width={16}
                        height={16}
                        className={
                          favorites.has(item.id)
                            ? "fill-red-500 text-red-500"
                            : "text-black"
                        }
                      />
                    </button>
                  </div>

                  <div className="mt-4 text-sm">
                    <p className="font-medium text-neutral-500">{item.title}</p>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-black">{item.subtitle}</p>
                      <p className="text-black">${item.price}</p>
                    </div>
                  </div>
                </div>

                {/* SIDE CONTROLS */}
                <div className="flex flex-col items-center gap-4 text-xs">
                  <XIcon className="text-neutral-400 cursor-pointer" />

                  <div className="w-7 h-7 border flex items-center justify-center text-black cursor-pointer">
                    {item.size}
                  </div>

                  <div
                    className="w-7 h-7 border cursor-pointer"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* QTY */}
                  <div className="flex flex-col items-center">
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.id, "inc")}
                      className="border border-neutral-400 text-black w-7 h-7 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>

                    <span className="border border-neutral-400 w-7 h-7 flex items-center justify-center text-black">
                      {item.qty}
                    </span>

                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(item.id, "dec")}
                      className="border border-neutral-400 text-black w-7 h-7 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="border bg-[#f3f3f3] p-8 h-fit">
            <h2 className="text-xs text-black uppercase tracking-wide mb-8">
              Order Summary
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-black">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>

              <div className="flex justify-between text-black">
                <span>Shipping</span>
                <span>${shipping}</span>
              </div>
            </div>

            <div className="border-t mt-6 pt-6 flex justify-between font-medium">
              <span className="flex gap-2 text-black">
                Total <p className="text-neutral-400">(Tax incl.)</p>
              </span>
              <span className="text-black">${total}</span>
            </div>

            <label className="flex gap-2 text-xs mt-6 text-neutral-600">
              <input type="checkbox" className="cursor-pointer" />I agree to the
              Terms and Conditions
            </label>

            <button className="w-full mt-6 bg-neutral-300 py-3 text-xs uppercase text-black cursor-pointer">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
