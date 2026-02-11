"use client";

import { cancelOrder } from "@/app/actions/order.actions";
import { toast } from "sonner";
import { useTransition, useState, useEffect, useRef } from "react";

export default function CancelOrderButton({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // ESC key close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (status !== "PENDING") return null;

  function handleConfirmCancel() {
    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        toast.success("Order cancelled successfully");
        setIsOpen(false);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to cancel order");
        }
      }
    });
  }

  // Click outside close
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="mt-6 w-full border border-red-500 text-red-500 py-2 text-sm font-semibold hover:bg-red-500 hover:text-white transition"
      >
        Cancel Order
      </button>

      {isOpen && (
        <div
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
          >
            <h2 className="text-lg font-bold text-black mb-4">
              Cancel this order?
            </h2>

            <p className="text-sm text-neutral-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm border border-neutral-300"
              >
                Keep Order
              </button>

              <button
                onClick={handleConfirmCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 transition"
              >
                {isPending ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
