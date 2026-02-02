"use client";

import { backfillOrderItemSnapshots } from "@/app/actions/admin.actions";
import { createProduct } from "@/app/actions/product.actions";
import { useTransition } from "react";
import { toast } from "sonner";

export default function MaintenancePage() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Maintenance</h1>

      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              const res = await backfillOrderItemSnapshots();
              toast.success(`Backfilled ${res.updated} order items`);
            } catch {
              toast.error("Backfill failed");
            }
          })
        }
        className="bg-black text-white px-6 py-3"
      >
        {isPending ? "Running…" : "Backfill Order Items"}
      </button>
      <button
        onClick={async () => {
          const product = await createProduct();
          console.log(product.id);
        }}
      >
        Create Product
      </button>
    </div>
  );
}
