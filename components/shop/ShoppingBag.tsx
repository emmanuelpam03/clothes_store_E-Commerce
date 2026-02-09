"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, useOptimistic, useEffect } from "react";
import { Heart, XIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { favouritesIcon } from "@/public/assets/images/images";
import { useCart } from "@/lib/cart/cart";
import {
  removeFromCart,
  updateCartQtyAction,
} from "@/app/actions/cart.actions";
import { useFavorites } from "@/lib/favorites/useFavorites";

export default function ShoppingBag() {
  const { items, updateQty, removeItem } = useCart();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { isFavorited, toggleFavorite } = useFavorites();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ✅ prevent empty flash
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // 🔥 OPTIMISTIC STATE (remove only)
  const [optimisticItems, removeOptimistic] = useOptimistic(
    items,
    (state, removedId: string) => state.filter((item) => item.id !== removedId),
  );

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(id);
    } catch {
      // ignore
    }
  };

  // ✅ OPTIMISTIC QTY UPDATE + DB SYNC
  const handleQtyChange = async (
    id: string,
    type: "inc" | "dec",
    currentQty: number,
  ) => {
    const nextQty = type === "inc" ? currentQty + 1 : currentQty - 1;
    if (nextQty < 1) return;

    // optimistic UI
    updateQty(id, type);

    if (!isLoggedIn) return;

    try {
      await updateCartQtyAction(id, nextQty);
      toast.success("Quantity updated");
    } catch {
      // rollback
      updateQty(id, type === "inc" ? "dec" : "inc");
      toast.error("Failed to update quantity");
    }
  };

  const subtotal = optimisticItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  // ⛔ block render until hydrated (prevents empty flash)
  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-center items-center gap-4 uppercase text-black text-xs mb-5">
          <Link href="/cart">shopping bag</Link>

          <Link href="/favorites" className="flex items-center gap-2">
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

        {/* EMPTY CART */}
        {optimisticItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-700 mb-4">
                Your cart is empty
              </p>
              <p className="text-neutral-500 mb-8">
                Add some items to get started
              </p>
              <Link href="/products">
                <button className="bg-black text-white px-8 py-3 uppercase text-sm font-semibold hover:bg-neutral-800 transition">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        ) : (
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
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md"
                      >
                        <Heart
                          width={16}
                          height={16}
                          className={
                            isFavorited(item.id)
                              ? "fill-red-500 text-red-500"
                              : "text-black"
                          }
                        />
                      </button>
                    </div>

                    <div className="mt-4 text-sm">
                      <p className="font-medium text-neutral-500">
                        {item.title}
                      </p>
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

                            removeOptimistic(item.id);
                            removeItem(item.id);

                            if (isLoggedIn) {
                              try {
                                await removeFromCart(item.id);
                                toast.success("Item removed");
                              } catch {
                                toast.error("Failed to remove item");
                              }
                            } else {
                              toast.success("Item removed");
                            }
                            setPendingId(null);
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
                      <button
                        onClick={() =>
                          handleQtyChange(item.id, "inc", item.qty)
                        }
                      >
                        +
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() =>
                          handleQtyChange(item.id, "dec", item.qty)
                        }
                      >
                        -
                      </button>
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
        )}
      </div>
    </div>
  );
}
