"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProductAdmin } from "@/app/actions/admin.actions";
import { toast } from "sonner";

interface ProductActionsProps {
  productSlug: string;
  productName: string;
}

export default function ProductActions({
  productSlug,
  productName,
}: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteProductAdmin(productSlug);
        toast.success(`${productName} deleted successfully`);
        setShowConfirm(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete product",
        );
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${productSlug}/edit`}
        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition"
        title="Edit product"
      >
        <Pencil size={16} />
      </Link>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition"
          title="Delete product"
        >
          <Trash2 size={16} />
        </button>
      ) : (
        <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
          <span className="text-xs text-red-800 font-medium">Delete?</span>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-2 py-0.5 rounded"
          >
            {isPending ? "..." : "Yes"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="text-xs bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
