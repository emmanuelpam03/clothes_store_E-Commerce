"use client";

import { createContext, useContext, useState } from "react";
import type { CartItem } from "./cart.types";
import { mapDbCartToUICart } from "./cart.mapper";
import { getOrCreateCart } from "@/app/actions/cart.actions";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, type: "inc" | "dec") => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  hydrateFromDb: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ✅ NEW
  // cart.tsx
  const hydrateFromDb = async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) return;
    const cart = await res.json();
    setItems(mapDbCartToUICart(cart));
  };

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
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
          : item
      )
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
