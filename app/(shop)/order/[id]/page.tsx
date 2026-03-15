import { getOrderById } from "@/app/actions/order.actions";
import { getPublicStoreSettingsAction } from "@/app/actions/store-settings.actions";
import CancelOrderButton from "@/components/shop/cancelOrderButton";
import ClearCartAfterOrder from "@/components/shop/ClearCartAfterOrder";
import RequestReturnButton from "@/components/shop/RequestReturnButton";
import { formatCurrencyFromCents } from "@/lib/money";
import Image from "next/image";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;

  let order;

  try {
    order = await getOrderById(id);
  } catch {
    notFound();
  }

  const storeSettings = await getPublicStoreSettingsAction().catch(() => null);
  const returnWindowDays = storeSettings?.returnWindowDays ?? 30;
  const currency = storeSettings?.currency ?? "USD";
  const hasActiveReturnRequest =
    order.returnRequests?.some((request) =>
      ["REQUESTED", "APPROVED", "RECEIVED"].includes(request.status),
    ) ?? false;
  const hasRefundedReturnRequest =
    order.returnRequests?.some((request) => request.status === "REFUNDED") ??
    false;
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const parseAmount = (value: unknown): number | undefined => {
    if (typeof value === "number") {
      if (!Number.isFinite(value)) {
        return undefined;
      }

      return Number.isInteger(value)
        ? Math.round(value)
        : Math.round(value * 100);
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }

      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        return undefined;
      }

      const hasDecimal = trimmed.includes(".") || !Number.isInteger(parsed);
      return hasDecimal ? Math.round(parsed * 100) : Math.round(parsed);
    }

    return undefined;
  };

  const orderRecord = order as Record<string, unknown>;
  const metadata =
    typeof orderRecord.metadata === "object" && orderRecord.metadata !== null
      ? (orderRecord.metadata as Record<string, unknown>)
      : null;

  const explicitShipping =
    parseAmount(orderRecord.shipping) ??
    parseAmount(orderRecord.shippingCost) ??
    parseAmount(orderRecord.shipping_cost) ??
    parseAmount(metadata?.shipping) ??
    parseAmount(metadata?.shippingCost) ??
    parseAmount(metadata?.shipping_cost);

  const discounts =
    parseAmount(orderRecord.discounts) ??
    parseAmount(orderRecord.discount) ??
    parseAmount(metadata?.discounts) ??
    parseAmount(metadata?.discount) ??
    0;

  const taxes =
    parseAmount(orderRecord.taxes) ??
    parseAmount(orderRecord.tax) ??
    parseAmount(metadata?.taxes) ??
    parseAmount(metadata?.tax) ??
    0;

  const fees =
    parseAmount(orderRecord.fees) ??
    parseAmount(orderRecord.fee) ??
    parseAmount(metadata?.fees) ??
    parseAmount(metadata?.fee) ??
    0;

  const fallbackShipping = Math.max(
    order.total - itemsSubtotal + discounts - taxes - fees,
    0,
  );
  const shippingCost = explicitShipping ?? fallbackShipping;

  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-12">
      <div className="mx-auto max-w-3xl bg-white border-2 border-neutral-300 p-8">
        {order.status === "CANCELLED" && (
          <div className="bg-red-100 text-red-800 p-4 mb-6 text-center">
            This order has been cancelled.
          </div>
        )}
        <h1 className="text-3xl font-black text-black mb-2">Order Confirmed</h1>

        <p className="text-sm text-neutral-600 mb-8">
          Thank you for your order. This is your order summary.
        </p>

        <div className="mb-8 border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          Returns are accepted within {returnWindowDays} days after delivery.
        </div>

        <div className="mb-8 space-y-2 text-sm">
          <p>
            <span className="font-medium">Order ID:</span>{" "}
            <span className="text-neutral-600">{order.id}</span>
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span className="text-neutral-600">{order.status}</span>
          </p>
          <p>
            <span className="font-medium">Payment Method:</span>{" "}
            <span className="text-neutral-600">Pay on Delivery</span>
          </p>
        </div>

        {/* Buyer info */}
        {"user" in order && order.user && (
          <div className="mb-8 border border-neutral-200 p-4 text-sm space-y-1">
            <p className="text-xs uppercase text-neutral-500 font-semibold mb-2">
              Ordered By
            </p>
            <p>
              <span className="font-medium">Name:</span>{" "}
              <span className="text-neutral-600">
                {(order.user as { name?: string | null }).name ?? "—"}
              </span>
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              <span className="text-neutral-600">
                {(order.user as { email?: string | null }).email ?? "—"}
              </span>
            </p>
          </div>
        )}

        <div className="border-t border-neutral-200 pt-6 space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              {item.product.image && (
                <div className="relative h-24 w-16 shrink-0 bg-neutral-100">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-black">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </p>
                  {"size" in item && item.size && (
                    <p className="text-xs text-neutral-500">
                      Size: {(item as { size: string }).size}
                    </p>
                  )}
                  {"color" in item && item.color && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-500">Color:</span>
                      <span
                        className="inline-block h-3 w-3 border border-neutral-300"
                        style={{
                          backgroundColor: (item as { color: string }).color,
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-black">
                  {formatCurrencyFromCents(
                    item.price * item.quantity,
                    currency,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 mt-8 pt-6 space-y-3">
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Subtotal</span>
            <span>{formatCurrencyFromCents(itemsSubtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Shipping</span>
            <span>
              {shippingCost === 0
                ? "Free"
                : formatCurrencyFromCents(shippingCost, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-lg font-bold">
              {formatCurrencyFromCents(order.total, currency)}
            </span>
          </div>
        </div>

        {order.returnRequests && order.returnRequests.length > 0 && (
          <div className="mt-6 border border-neutral-200 p-4">
            <h2 className="text-sm font-semibold mb-3">Return Requests</h2>
            <div className="space-y-3">
              {order.returnRequests.map((request) => (
                <div key={request.id} className="border border-neutral-200 p-3">
                  <p className="text-xs text-neutral-500 mb-1">
                    {new Date(request.requestedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm font-semibold text-black mb-1">
                    Status: {request.status}
                  </p>
                  <p className="text-sm text-neutral-700">{request.reason}</p>
                  {request.adminNote && (
                    <p className="text-sm text-neutral-600 mt-2">
                      Admin note: {request.adminNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Order Button */}
        {order.status === "PENDING" && (
          <div className="mt-6">
            <CancelOrderButton orderId={order.id} status={order.status} />
          </div>
        )}

        {order.status === "DELIVERED" &&
          !hasActiveReturnRequest &&
          !hasRefundedReturnRequest && (
            <div className="mt-4">
              <RequestReturnButton orderId={order.id} />
            </div>
          )}

        {order.status === "DELIVERED" && hasRefundedReturnRequest && (
          <div className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            This order has been refunded.
          </div>
        )}

        <ClearCartAfterOrder orderId={order.id} />
      </div>
    </div>
  );
}
