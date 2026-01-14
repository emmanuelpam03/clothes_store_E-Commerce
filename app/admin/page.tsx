import StatCard from "@/components/admin/StatCard";
import Table, { Column } from "@/components/admin/Table";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users as UsersIcon,
} from "lucide-react";

type Order = {
  id: string;
  customer: string;
  status: "Pending" | "Completed" | "Cancelled";
  amount: string;
  date: string;
};

const recentOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Jane Smith",
    status: "Completed",
    amount: "$249.99",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "John Doe",
    status: "Pending",
    amount: "$149.50",
    date: "2024-01-16",
  },
  {
    id: "ORD-003",
    customer: "Sarah Johnson",
    status: "Completed",
    amount: "$399.99",
    date: "2024-01-16",
  },
];

const orderColumns: Column<Order>[] = [
  { key: "id", label: "Order ID" },
  { key: "customer", label: "Customer" },
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

export default function DashboardPage() {
  
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Overview</h1>
        <p className="text-slate-600 mt-1">
          Welcome back! Here&apos;s your business performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$18,240"
          change="+12.5%"
          icon={<TrendingUp size={24} className="text-blue-500" />}
        />
        <StatCard
          title="Orders Today"
          value="48"
          change="+8.2%"
          icon={<ShoppingCart size={24} className="text-cyan-500" />}
        />
        <StatCard
          title="Active Products"
          value="126"
          change="+2.1%"
          icon={<Package size={24} className="text-indigo-500" />}
        />
        <StatCard
          title="Total Customers"
          value="1,394"
          change="+18.7%"
          icon={<UsersIcon size={24} className="text-purple-500" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recent Orders
        </h2>
        <Table columns={orderColumns} data={recentOrders} />
      </div>
    </div>
  );
}
