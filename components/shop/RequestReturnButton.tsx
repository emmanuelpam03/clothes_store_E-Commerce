"use client";

import { createReturnRequest } from "@/app/actions/order.actions";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function RequestReturnButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const submitRequest = () => {
    startTransition(async () => {
      try {
        await createReturnRequest(orderId, reason);
        toast.success("Return request submitted");
        setReason("");
        setIsOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to submit request",
        );
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border border-black text-black py-2 text-sm font-semibold hover:bg-black hover:text-white transition"
      >
        Request Return
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isPending && setIsOpen(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && !isPending && setIsOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            className="w-full max-w-lg bg-white border border-neutral-300 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="return-modal-title"
              className="text-lg font-bold text-black mb-2"
            >
              Request a Return
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Tell us why you want to return this order. Minimum 10 characters.
            </p>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Example: Size did not fit as expected"
              className="w-full min-h-28 border border-neutral-300 p-3 text-sm outline-none focus:border-black"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm border border-neutral-300"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={isPending || reason.trim().length < 10}
                className="px-4 py-2 text-sm bg-black text-white disabled:opacity-50"
              >
                {isPending ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}{" "}
    </>
  );
}
