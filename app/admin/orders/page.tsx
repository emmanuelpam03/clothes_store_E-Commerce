import Table, { Column } from "@/components/admin/Table";
import { ShoppingCart } from "lucide-react";

type Order = {
  id: string;
  customer: string;
  status: "Pending" | "Completed" | "Cancelled";
  items: number;
  amount: string;
  date: string;
};

const orders: Order[] = [
  {
    id: "ORD-001",
    customer: "Jane Smith",
    status: "Completed",
    items: 2,
    amount: "$249.99",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "John Doe",
    status: "Pending",
    items: 1,
    amount: "$149.50",
    date: "2024-01-16",
  },
  {
    id: "ORD-003",
    customer: "Sarah Johnson",
    status: "Completed",
    items: 3,
    amount: "$399.99",
    date: "2024-01-16",
  },
  {
    id: "ORD-004",
    customer: "Mike Wilson",
    status: "Cancelled",
    items: 1,
    amount: "$79.99",
    date: "2024-01-14",
  },
];

const columns: Column<Order>[] = [
  { key: "id", label: "Order ID" },
  { key: "customer", label: "Customer" },
  { key: "items", label: "Items" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          v === "Completed"
            ? "bg-green-100 text-green-700"
            : v === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {String(v)}
      </span>
    ),
  },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
];

export default function OrdersPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600 mt-1">
          View and manage all your customer orders.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <Table columns={columns} data={orders} />
      </div>
    </div>
  );
}
