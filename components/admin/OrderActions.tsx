"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatusAdmin,
  cancelOrderAdmin,
} from "@/app/actions/admin.actions";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function OrderActions({
  orderId,
  currentStatus,
}: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>(currentStatus);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === selectedStatus || loading) return;

    // Prevent selecting CANCELLED from dropdown - must use Cancel button
    if (newStatus === "CANCELLED") {
      alert("Please use the Cancel button to cancel orders.");
      return;
    }

    setLoading(true);
    try {
      await updateOrderStatusAdmin(orderId, newStatus);
      setSelectedStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update order status",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await cancelOrderAdmin(orderId);
      setSelectedStatus("CANCELLED");
      router.refresh();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    selectedStatus === "CANCELLED" || selectedStatus === "SHIPPED" || loading;

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedStatus}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={isDisabled}
        className="px-3 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="SHIPPED">Shipped</option>
        {/* CANCELLED is removed - use Cancel button instead */}
      </select>

      {selectedStatus !== "CANCELLED" && (
        <button
          onClick={handleCancelOrder}
          disabled={loading}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Cancel"}
        </button>
      )}

      <button
        onClick={() => router.push(`/admin/orders/${orderId}`)}
        className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        View Details
      </button>
    </div>
  );
}
