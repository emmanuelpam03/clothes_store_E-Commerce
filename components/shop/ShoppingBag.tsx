"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useOptimistic } from "react";
import { Heart, XIcon } from "lucide-react";
import { toast } from "sonner";

import { favouritesIcon } from "@/public/assets/images/images";
import { useCart } from "@/lib/cart/cart";
import { removeFromCart } from "@/app/actions/cart.actions";

export default function ShoppingBag() {
  const { items, updateQty, removeItem } = useCart();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 🔥 OPTIMISTIC STATE
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (state, removedId: string) => state.filter((item) => item.id !== removedId)
  );

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const subtotal = optimisticItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-center items-center gap-4 uppercase text-black text-xs mb-5">
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
          {/* CART ITEMS */}
          <div className="flex flex-wrap gap-12 py-5 border-y border-neutral-300 justify-center">
            {optimisticItems.map((item) => (
              <div key={item.id} className="flex gap-6 w-fit sm:w-[320px]">
                {/* PRODUCT */}
                <div>
                  <div className="relative w-[220px] h-[300px] border bg-white">
                    <Image
                      src={item.image ?? "/placeholder.png"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />

                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md"
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
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-black">{item.subtitle}</p>
                      <p>${item.price}</p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col items-center gap-4 text-xs">
                  {/* DELETE */}
                  {pendingId === item.id ? (
                    <span className="text-red-600 text-sm">Deleting...</span>
                  ) : (
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          setPendingId(item.id);

                          // 🔥 instant UI removal
                          removeOptimistic(item.id);

                          // sync real state
                          removeItem(item.id);

                          try {
                            await removeFromCart(item.id);
                            toast.success("Item removed");
                          } catch {
                            toast.error("Failed to remove item");
                          } finally {
                            setPendingId(null);
                          }
                        })
                      }
                    >
                      <XIcon className="text-neutral-400 cursor-pointer" />
                    </button>
                  )}

                  {/* SIZE */}
                  <div className="w-7 h-7 border flex items-center justify-center">
                    {item.size}
                  </div>

                  {/* COLOR */}
                  <div
                    className="w-7 h-7 border"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* QTY */}
                  <div className="flex flex-col items-center">
                    <button onClick={() => updateQty(item.id, "inc")}>+</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, "dec")}>-</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="border bg-[#f3f3f3] p-8 h-fit">
            <h2 className="text-xs uppercase mb-8">Order Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping}</span>
              </div>
            </div>

            <div className="border-t mt-6 pt-6 flex justify-between font-medium">
              <span>Total</span>
              <span>${total}</span>
            </div>

            <Link href="/checkout">
              <button className="w-full mt-6 bg-neutral-300 py-3 uppercase">
                Continue
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
