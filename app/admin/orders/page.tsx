import Table, { Column } from "@/components/admin/Table";
import OrderActions from "@/components/admin/OrderActions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getAllOrdersAdmin } from "@/app/actions/admin.actions";

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

type Order = {
  id: string;
  customer: string;
  email: string;
  status: OrderStatus;
  items: number;
  amount: string;
  date: string;
  actions: {
    orderId: string;
    currentStatus: OrderStatus;
  };
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadge(status: OrderStatus) {
  const statusStyles: Record<OrderStatus, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

const columns: Column<Order>[] = [
  {
    key: "id",
    label: "Order ID",
    render: (v) => (
      <span className="font-mono text-sm">{String(v).slice(0, 8)}</span>
    ),
  },
  { key: "customer", label: "Customer" },
  { key: "email", label: "Email" },
  { key: "items", label: "Items" },
  {
    key: "status",
    label: "Status",
    render: (v) => getStatusBadge(v as OrderStatus),
  },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  {
    key: "actions",
    label: "Actions",
    render: (v) => {
      const actions = v as Order["actions"];
      return (
        <OrderActions
          orderId={actions.orderId}
          currentStatus={actions.currentStatus}
        />
      );
    },
  },
];

export default async function OrdersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound(); // hides existence of route
  }

  const dbOrders = await getAllOrdersAdmin();

  const orders: Order[] = dbOrders.map((order) => ({
    id: order.id,
    customer: order.user.name || "Unknown",
    email: order.user.email || "N/A",
    status: order.status,
    items: order.items.length,
    amount: formatCurrency(order.total),
    date: formatDate(order.createdAt),
    actions: {
      orderId: order.id,
      currentStatus: order.status,
    },
  }));

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-1">
          View and manage all customer orders.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No orders found.
          </div>
        ) : (
          <Table columns={columns} data={orders} />
        )}
      </div>
    </div>
  );
}
