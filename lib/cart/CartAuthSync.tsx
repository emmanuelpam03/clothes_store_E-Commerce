"use client";

import { useEffect, useRef } from "react";
import { mergeGuestCartAction } from "@/app/actions/cart.actions";
import { useCart } from "@/lib/cart/cart";
import { useSession } from "next-auth/react";
import type { CartItem } from "@/lib/cart/cart.types";

const GUEST_FAVORITES_KEY = "guest-favorites";

export default function CartAuthSync() {
  const { status } = useSession();
  const { hydrateFromDb } = useCart();

  const hasMerged = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasMerged.current) return;

    hasMerged.current = true;

    const guestCart = JSON.parse(
      localStorage.getItem("guest-cart") ?? "[]",
    ) as CartItem[];

    (async () => {
      if (guestCart.length > 0) {
        await mergeGuestCartAction(guestCart);
        localStorage.removeItem("guest-cart");
      }

      // Discard guest favorites on login - they stay local-only and never go to DB
      localStorage.removeItem(GUEST_FAVORITES_KEY);

      await hydrateFromDb();
    })();
  }, [status, hydrateFromDb]);

  return null;
}
