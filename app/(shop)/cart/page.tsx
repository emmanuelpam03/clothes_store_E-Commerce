import ShoppingBagPage from "@/components/shop/ShoppingBag";
import ShoppingBagSkeleton from "@/components/shop/skeleton/ShoppingBagSkeleton";
import { Suspense } from "react";

export default function CartPage() {
  return (
    <div>
      <Suspense fallback={<ShoppingBagSkeleton />}>
        <ShoppingBagPage />
      </Suspense>
    </div>
  );
}
