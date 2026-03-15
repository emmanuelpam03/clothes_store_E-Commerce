"use client";

import { updateReturnRequestStatusAdmin } from "@/app/actions/admin.actions";
import { ReturnRequestStatus } from "@/app/generated/prisma/enums";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ReturnRequestActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: ReturnRequestStatus;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const transitions: Record<ReturnRequestStatus, ReturnRequestStatus[]> = {
    [ReturnRequestStatus.REQUESTED]: [
      ReturnRequestStatus.APPROVED,
      ReturnRequestStatus.REJECTED,
    ],
    [ReturnRequestStatus.APPROVED]: [
      ReturnRequestStatus.RECEIVED,
      ReturnRequestStatus.REJECTED,
    ],
    [ReturnRequestStatus.REJECTED]: [],
    [ReturnRequestStatus.RECEIVED]: [ReturnRequestStatus.REFUNDED],
    [ReturnRequestStatus.REFUNDED]: [],
  };

  const nextStates = transitions[currentStatus] ?? [];

  const updateStatus = async (nextStatus: ReturnRequestStatus) => {
    if (isPending) return;

    setIsPending(true);
    try {
      await updateReturnRequestStatusAdmin(requestId, nextStatus);
      toast.success(`Return status updated to ${nextStatus}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update return status",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {nextStates.length === 0 ? (
        <span className="text-xs text-slate-500">Final status</span>
      ) : (
        nextStates.map((status) => (
          <button
            key={status}
            disabled={isPending}
            onClick={() => updateStatus(status)}
            className="px-2 py-1 text-xs border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50"
          >
            Mark {status}
          </button>
        ))
      )}
    </div>
  );
}
