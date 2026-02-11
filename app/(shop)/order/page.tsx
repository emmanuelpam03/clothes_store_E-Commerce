import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import OrderPageCartClear from "@/components/shop/OrderPageCartClear";
import { getOrders } from "@/app/actions/order.actions";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await getOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <OrderPageCartClear />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8">YOUR ORDERS</h1>

        {orders.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <p className="text-neutral-600 mb-4">
              You have not placed any orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-8 py-3 text-sm font-semibold uppercase hover:bg-neutral-800 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-neutral-200 p-8"
              >
                {/* ORDER HEADER */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b">
                  <div>
                    <p className="text-sm text-neutral-500">Order ID</p>
                    <p className="text-lg font-semibold">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Order Date</p>
                    <p className="text-lg font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Total</p>
                    <p className="text-lg font-semibold">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <Link href={`/order/${order.id}`}>
                  <p className="text-sm text-blue-600 hover:underline">
                    View Details
                  </p>
                </Link>
                <div className="space-y-4 mb-6">
                  <p className="text-sm font-semibold">Items</p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-neutral-50">
                      {item.image && (
                        <div className="relative w-20 h-20 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name || "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm mt-2">
                          ${(item.price / 100).toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ACTION */}
                {order.status === "PENDING" && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-neutral-500 mb-3">
                      Payment method: Pay on Delivery
                    </p>
                    <p className="text-sm font-semibold text-neutral-700">
                      Please pay ${(order.total / 100).toFixed(2)} when you
                      receive your order.
                    </p>
                  </div>
                )}

                {order.status === "SHIPPED" && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-green-700 font-semibold">
                      Your order is on the way! Track your shipment for updates.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
