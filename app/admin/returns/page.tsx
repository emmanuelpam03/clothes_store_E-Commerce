import { auth } from "@/lib/auth";
import { ReturnRequestStatus } from "@/app/generated/prisma/enums";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getAllReturnRequestsAdmin } from "@/app/actions/admin.actions";
import ReturnRequestActions from "@/components/admin/ReturnRequestActions";

function getStatusBadgeClass(status: ReturnRequestStatus): string {
  const classes: Record<ReturnRequestStatus, string> = {
    [ReturnRequestStatus.REQUESTED]: "bg-yellow-100 text-yellow-700",
    [ReturnRequestStatus.APPROVED]: "bg-blue-100 text-blue-700",
    [ReturnRequestStatus.REJECTED]: "bg-red-100 text-red-700",
    [ReturnRequestStatus.RECEIVED]: "bg-purple-100 text-purple-700",
    [ReturnRequestStatus.REFUNDED]: "bg-emerald-100 text-emerald-700",
  };

  return classes[status];
}

export default async function AdminReturnsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    notFound();
  }

  const requests = await getAllReturnRequestsAdmin();

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Returns</h1>
        <p className="text-slate-600 mt-1">
          Review customer return requests and update processing stages.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
        {requests.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No return requests yet.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-3 pr-4">Request</th>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Reason</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-100 align-top"
                >
                  <td className="py-4 pr-4">
                    <div className="font-medium text-slate-900">
                      {request.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(request.requestedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <Link
                      href={`/admin/orders/${request.orderId}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {request.orderId.slice(0, 8)}
                    </Link>
                    <div className="text-xs text-slate-500 mt-1">
                      {request.orderStatus}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="font-medium text-slate-900">
                      {request.customerName || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {request.customerEmail || "N/A"}
                    </div>
                  </td>
                  <td className="py-4 pr-4 max-w-xs text-slate-700">
                    {request.reason}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                        request.status as ReturnRequestStatus,
                      )}`}
                    >
                      {request.status}
                    </span>
                    {request.adminNote && (
                      <p className="text-xs text-slate-500 mt-2">
                        {request.adminNote}
                      </p>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    <ReturnRequestActions
                      requestId={request.id}
                      currentStatus={request.status as ReturnRequestStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
