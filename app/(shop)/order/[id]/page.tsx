import { getOrderById } from "@/app/actions/order.actions";
import CancelOrderButton from "@/components/shop/cancelOrderButton";
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

        <div className="border-t border-neutral-200 pt-6 space-y-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">
                  {item.product.name}
                </p>
                {item.product.image && (
                  <p className="text-sm font-medium text-black">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="w-12 h-16"
                    />
                  </p>
                )}
                <p className="text-xs text-neutral-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="text-sm font-medium text-black">
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-200 mt-8 pt-6 flex justify-between">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-lg font-bold">
            ${(order.total / 100).toFixed(2)}
          </span>
        </div>

        {/* Cancel Order Button */}
        {order.status === "PENDING" && (
          <div className="mt-6">
            <CancelOrderButton orderId={order.id} status={order.status} />
          </div>
        )}
      </div>
    </div>
  );
}
