"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  useTransition,
  useOptimistic,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Heart, XIcon, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { favouritesIcon } from "@/public/assets/images/images";
import { useCart } from "@/lib/cart/cart";
import { config } from "@/constants/config";
import {
  removeFromCart,
  updateCartQtyAction,
  updateCartItemAction,
} from "@/app/actions/cart.actions";
import { getProductsByIds } from "@/app/actions/product.actions";
import { useFavorites } from "@/lib/favorites/useFavorites";
import { parseColor } from "@/components/admin/ColorPicker";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2X"];
const DEFAULT_COLORS = ["Black", "White", "Gray", "Blue", "Red", "Green"];

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

const getColorValue = (color: string): string => {
  const normalizedColor = color.trim();
  const colorMapEntry = Object.entries(COLOR_MAP).find(
    ([key]) => key.toLowerCase() === normalizedColor.toLowerCase(),
  );
  if (colorMapEntry) return colorMapEntry[1];
  const hexColorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  if (hexColorRegex.test(normalizedColor)) return normalizedColor;
  return "#d4d4d4";
};

const isDarkColor = (color: string): boolean => {
  const darkColors = ["Black", "Navy", "Burgundy", "Brown", "Purple"];
  return darkColors.some((dark) =>
    color.toLowerCase().includes(dark.toLowerCase()),
  );
};

type ProductData = {
  id: string;
  sizes: string[];
  colors: string[];
};

export default function ShoppingBag() {
  const { items, updateQty, updateItem, removeItem } = useCart();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { isFavorited, toggleFavorite } = useFavorites();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [productsData, setProductsData] = useState<Map<string, ProductData>>(
    new Map(),
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const optionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // prevent empty flash
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  // Memoize unique product IDs to track when to refetch product data
  const uniqueProductIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.productId))),
    [items],
  );

  // Fetch product data for sizes and colors
  useEffect(() => {
    if (uniqueProductIds.length === 0) {
      return;
    }

    const fetchProductData = async () => {
      const products = await getProductsByIds(uniqueProductIds);

      const dataMap = new Map<string, ProductData>();
      products.forEach((p) => {
        dataMap.set(p.id, {
          id: p.id,
          sizes: p.sizes && p.sizes.length > 0 ? p.sizes : DEFAULT_SIZES,
          colors: p.colors && p.colors.length > 0 ? p.colors : DEFAULT_COLORS,
        });
      });
      setProductsData(dataMap);
    };

    fetchProductData();
  }, [uniqueProductIds]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setOpenDropdown(null);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manage focus when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && openDropdown) {
      const key = `${openDropdown}-${focusedIndex}`;
      optionRefs.current.get(key)?.focus();
    }
  }, [focusedIndex, openDropdown]);

  // OPTIMISTIC STATE (remove only)
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

  // OPTIMISTIC QTY UPDATE + DB SYNC
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

  // UPDATE SIZE OR COLOR
  const handleUpdateItem = async (
    id: string,
    field: "size" | "color",
    value: string,
  ) => {
    const item = items.find((i) => i.id === id);
    const previousValue = item?.[field];

    // optimistic UI
    updateItem(id, { [field]: value });

    if (!isLoggedIn) return;

    try {
      await updateCartItemAction(id, { [field]: value });
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated`,
      );
    } catch {
      // rollback on failure
      if (previousValue !== undefined) {
        updateItem(id, { [field]: previousValue });
      }
      toast.error(`Failed to update ${field}`);
    }
  };
  const subtotal = optimisticItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );
  const shipping = subtotal > 0 ? config.shippingCostCents : 0;
  const total = subtotal + shipping;

  // block render until hydrated (prevents empty flash)
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
                        onClick={(e) => handleToggleFavorite(item.productId, e)}
                        className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md"
                      >
                        <Heart
                          width={16}
                          height={16}
                          className={
                            isFavorited(item.productId)
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
                        <p>${item.price / 100}</p>
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
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => {
                          const isOpen = openDropdown === `size-${item.id}`;
                          setOpenDropdown(isOpen ? null : `size-${item.id}`);
                          setFocusedIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setOpenDropdown(`size-${item.id}`);
                            setFocusedIndex(0);
                          } else if (
                            e.key === "Escape" &&
                            openDropdown === `size-${item.id}`
                          ) {
                            setOpenDropdown(null);
                            setFocusedIndex(-1);
                          }
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={openDropdown === `size-${item.id}`}
                        aria-label="Select size"
                        className="px-3 py-2 min-w-[60px] border border-neutral-300 rounded-md text-xs font-medium cursor-pointer hover:border-black transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 flex items-center justify-between gap-2"
                      >
                        <span>{item.size}</span>
                        <ChevronDown size={12} />
                      </button>
                      {openDropdown === `size-${item.id}` && (
                        <div
                          role="listbox"
                          aria-label="Size options"
                          className="absolute z-10 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-48 overflow-auto"
                        >
                          {(
                            productsData.get(item.productId)?.sizes ||
                            DEFAULT_SIZES
                          ).map((size, idx) => (
                            <button
                              key={size}
                              ref={(el) => {
                                const refKey = `size-${item.id}-${idx}`;
                                if (el) {
                                  optionRefs.current.set(refKey, el);
                                } else {
                                  optionRefs.current.delete(refKey);
                                }
                              }}
                              role="option"
                              aria-selected={item.size === size}
                              tabIndex={focusedIndex === idx ? 0 : -1}
                              onClick={() => {
                                handleUpdateItem(item.id, "size", size);
                                setOpenDropdown(null);
                                setFocusedIndex(-1);
                              }}
                              onKeyDown={(e) => {
                                const sizes =
                                  productsData.get(item.productId)?.sizes ||
                                  DEFAULT_SIZES;
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleUpdateItem(item.id, "size", size);
                                  setOpenDropdown(null);
                                  setFocusedIndex(-1);
                                } else if (e.key === "ArrowDown") {
                                  e.preventDefault();
                                  setFocusedIndex(
                                    idx === sizes.length - 1 ? 0 : idx + 1,
                                  );
                                } else if (e.key === "ArrowUp") {
                                  e.preventDefault();
                                  setFocusedIndex(
                                    idx === 0 ? sizes.length - 1 : idx - 1,
                                  );
                                } else if (e.key === "Escape") {
                                  e.preventDefault();
                                  setOpenDropdown(null);
                                  setFocusedIndex(-1);
                                }
                              }}
                              onFocus={() => setFocusedIndex(idx)}
                              className={`w-full px-3 py-2 text-xs font-medium text-left hover:bg-neutral-100 transition ${
                                item.size === size
                                  ? "bg-neutral-100 font-semibold"
                                  : ""
                              } ${
                                focusedIndex === idx
                                  ? "ring-2 ring-black ring-inset"
                                  : ""
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* COLOR */}
                    <div className="relative dropdown-container">
                      <button
                        onClick={() => {
                          const isOpen = openDropdown === `color-${item.id}`;
                          setOpenDropdown(isOpen ? null : `color-${item.id}`);
                          setFocusedIndex(-1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setOpenDropdown(`color-${item.id}`);
                            setFocusedIndex(0);
                          } else if (
                            e.key === "Escape" &&
                            openDropdown === `color-${item.id}`
                          ) {
                            setOpenDropdown(null);
                            setFocusedIndex(-1);
                          }
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={openDropdown === `color-${item.id}`}
                        aria-label="Select color"
                        className="px-3 py-2 min-w-[90px] border border-neutral-300 rounded-md text-xs font-medium cursor-pointer hover:border-black transition-all focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 flex items-center justify-between gap-2"
                        style={{
                          backgroundColor: getColorValue(
                            parseColor(item.color).value,
                          ),
                          color: isDarkColor(item.color) ? "white" : "black",
                        }}
                      >
                        <span>{parseColor(item.color).name}</span>
                        <ChevronDown size={12} />
                      </button>
                      {openDropdown === `color-${item.id}` && (
                        <div
                          role="listbox"
                          aria-label="Color options"
                          className="absolute z-10 mt-1 w-full bg-white border border-neutral-300 rounded-md shadow-lg max-h-48 overflow-auto"
                        >
                          {(
                            productsData.get(item.productId)?.colors ||
                            DEFAULT_COLORS
                          ).map((color, idx) => {
                            const parsed = parseColor(color);
                            return (
                              <button
                                key={color}
                                ref={(el) => {
                                  const refKey = `color-${item.id}-${idx}`;
                                  if (el) {
                                    optionRefs.current.set(refKey, el);
                                  } else {
                                    optionRefs.current.delete(refKey);
                                  }
                                }}
                                role="option"
                                aria-selected={item.color === color}
                                tabIndex={focusedIndex === idx ? 0 : -1}
                                onClick={() => {
                                  handleUpdateItem(item.id, "color", color);
                                  setOpenDropdown(null);
                                  setFocusedIndex(-1);
                                }}
                                onKeyDown={(e) => {
                                  const colors =
                                    productsData.get(item.productId)?.colors ||
                                    DEFAULT_COLORS;
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleUpdateItem(item.id, "color", color);
                                    setOpenDropdown(null);
                                    setFocusedIndex(-1);
                                  } else if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setFocusedIndex(
                                      idx === colors.length - 1 ? 0 : idx + 1,
                                    );
                                  } else if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setFocusedIndex(
                                      idx === 0 ? colors.length - 1 : idx - 1,
                                    );
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    setOpenDropdown(null);
                                    setFocusedIndex(-1);
                                  }
                                }}
                                onFocus={() => setFocusedIndex(idx)}
                                className={`w-full px-3 py-2 text-xs font-medium text-left hover:bg-neutral-50 transition flex items-center gap-2 ${
                                  item.color === color
                                    ? "bg-neutral-50 font-semibold"
                                    : ""
                                } ${
                                  focusedIndex === idx
                                    ? "ring-2 ring-black ring-inset"
                                    : ""
                                }`}
                              >
                                <div
                                  className="w-4 h-4 rounded-full border border-neutral-300"
                                  style={{
                                    backgroundColor: getColorValue(
                                      parsed.value,
                                    ),
                                  }}
                                />
                                {parsed.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* QTY */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() =>
                          handleQtyChange(item.id, "inc", item.qty)
                        }
                        className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded-md text-sm font-semibold hover:bg-black hover:text-white hover:border-black transition-all"
                      >
                        +
                      </button>
                      <span className="text-sm font-medium my-1">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          handleQtyChange(item.id, "dec", item.qty)
                        }
                        className="w-7 h-7 flex items-center justify-center border border-neutral-300 rounded-md text-sm font-semibold hover:bg-black hover:text-white hover:border-black transition-all"
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
                  <span>${subtotal / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping}</span>
                </div>
              </div>

              <div className="border-t mt-6 pt-6 flex justify-between font-medium">
                <span>Total</span>
                <span>${total / 100}</span>
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
