import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getOrderByIdAdmin } from "@/app/actions/admin.actions";
import OrderActions from "@/components/admin/OrderActions";
import Image from "next/image";
import Link from "next/link";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: OrderStatus) {
  const statusStyles: Record<OrderStatus, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-sm font-semibold px-4 py-2 rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const { orderId } = await params;
  const order = await getOrderByIdAdmin(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Order Details</h1>
          <p className="text-slate-600 mt-1">Order ID: {order.id}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusBadge(order.status)}
          <OrderActions orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-slate-200 last:border-0"
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name || "Product"}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {item.product ? (
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {item.name || item.product.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {item.name || "Unknown Product"}
                      </span>
                    )}
                    <div className="text-sm text-slate-600 mt-1">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && (
                        <span className="ml-3">Color: {item.color}</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Quantity: {item.quantity}
                    </div>
                    {item.product && !item.product.active && (
                      <span className="text-xs text-red-600 mt-1 inline-block">
                        Product Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatCurrency(item.price)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <div className="font-semibold text-slate-900">
                    Order Created
                  </div>
                  <div className="text-sm text-slate-600">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
              {new Date(order.updatedAt).getTime() !==
                new Date(order.createdAt).getTime() && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Last Updated
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(order.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Name</div>
                <div className="font-semibold text-slate-900">
                  {order.user.name || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-semibold text-slate-900">
                  {order.user.email || "N/A"}
                </div>
              </div>
              <div>
                <Link
                  href={`/admin/users?userId=${order.user.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Customer Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Shipping Details
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Contact</div>
                <div className="font-semibold text-slate-900">
                  {order.firstName} {order.lastName}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-semibold text-slate-900">
                  {order.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Phone</div>
                <div className="font-semibold text-slate-900">
                  {order.phone}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Address</div>
                <div className="font-semibold text-slate-900">
                  {order.address}
                  <br />
                  {order.city}, {order.zipCode}
                  <br />
                  {order.country}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Items</span>
                <span className="font-semibold text-slate-900">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-slate-900 text-lg">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
