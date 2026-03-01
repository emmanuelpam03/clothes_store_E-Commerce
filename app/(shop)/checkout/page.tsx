"use client";

import { useCart } from "@/lib/cart/cart";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Checkout from "@/components/shop/CheckoutPage";
import { toast } from "sonner";
import { getProductsByIds } from "@/app/actions/product.actions";

export default function CheckoutPage() {
  const { items } = useCart();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      toast.error(
        "Your cart is empty. Please add items to proceed to checkout.",
      );
      router.replace("/cart");
      return;
    }

    // Validate stock before allowing checkout
    const validateStock = async () => {
      try {
        const productIds = Array.from(
          new Set(items.map((item) => item.productId)),
        );
        const products = await getProductsByIds(productIds);

        const stockIssues: string[] = [];

        items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          const stockQuantity = product?.inventory?.quantity ?? 0;

          if (stockQuantity === 0) {
            stockIssues.push(`${item.title} is out of stock`);
          } else if (stockQuantity < item.qty) {
            stockIssues.push(
              `${item.title} - only ${stockQuantity} available (you have ${item.qty} in cart)`,
            );
          }
        });

        if (stockIssues.length > 0) {
          toast.error("Stock issues detected. Please update your cart.", {
            description: stockIssues[0],
          });
          router.replace("/cart");
          return;
        }

        setIsValidating(false);
      } catch (error) {
        toast.error("Failed to validate cart. Please try again.");
        router.replace("/cart");
      }
    };
    validateStock();
  }, [items, router]);

  if (items.length === 0 || isValidating) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">Validating cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Checkout />
    </div>
  );
}
