"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { CartItem } from "./cart.types";
import { mapDbCartToUICart } from "./cart.mapper";
import { getOrCreateCart } from "@/app/actions/cart.actions";

const GUEST_CART_KEY = "guest-cart";

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, type: "inc" | "dec") => void;
  updateItem: (
    id: string,
    updates: Partial<Pick<CartItem, "size" | "color">>,
  ) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  hydrateFromDb: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const wasLoggedInRef = useRef(false);

  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load guest cart from localStorage on mount (deferred to avoid cascading render lint)
  useEffect(() => {
    const stored = loadGuestCart();
    queueMicrotask(() => {
      setItems(stored);
      setIsHydrated(true);
    });
  }, []);

  // When user logs out, switch to guest cart from localStorage (don't keep logged-in cart)
  useEffect(() => {
    if (!isHydrated) return;
    if (wasLoggedInRef.current && !isLoggedIn && status !== "loading") {
      const stored = loadGuestCart();
      queueMicrotask(() => setItems(stored));
    }
    if (isLoggedIn) wasLoggedInRef.current = true;
  }, [isHydrated, isLoggedIn, status]);

  // Only persist to localStorage when guest - never overwrite guest-cart with logged-in user's cart
  useEffect(() => {
    if (!isHydrated || isLoggedIn) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, [items, isHydrated, isLoggedIn]);

  // ✅ NEW
  // cart.tsx
  const hydrateFromDb = async () => {
    const cart = await getOrCreateCart();
    setItems(mapDbCartToUICart(cart));
  };

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.color === item.color,
      );
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id ? { ...p, qty: p.qty + item.qty } : p,
        );
      }
      return [...prev, item];
    });
  };

  const updateQty = (id: string, type: "inc" | "dec") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + (type === "inc" ? 1 : -1)) }
          : item,
      ),
    );
  };

  const updateItem = (
    id: string,
    updates: Partial<Pick<CartItem, "size" | "color">>,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        updateItem,
        removeItem,
        clearCart,
        hydrateFromDb,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
