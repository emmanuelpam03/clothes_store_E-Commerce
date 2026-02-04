"use client";

import { useEffect, useRef } from "react";
import { mergeGuestCartAction } from "@/app/actions/cart.actions";
import { useCart } from "@/lib/cart/cart";
import { useSession } from "next-auth/react";

export default function CartAuthSync() {
  const { data: session, status } = useSession();
  const { hydrateFromDb } = useCart();

  const hasMerged = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (hasMerged.current) return;

    hasMerged.current = true;

    const guestCart = JSON.parse(localStorage.getItem("guest-cart") ?? "[]");

    (async () => {
      if (guestCart.length > 0) {
        await mergeGuestCartAction(guestCart);
        localStorage.removeItem("guest-cart");
      }

      await hydrateFromDb();
    })();
  }, [status]);

  return null;
}
