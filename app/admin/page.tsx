import StatCard from "@/components/admin/StatCard";
import Table, { Column } from "@/components/admin/Table";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users as UsersIcon,
} from "lucide-react";
import { getAdminStats } from "@/app/actions/admin.actions";
import prisma from "@/lib/prisma";

type Order = {
  id: string;
  customer: string;
  status: "Pending" | "Completed" | "Cancelled";
  amount: string;
  date: string;
};

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

export default async function DashboardPage() {
  const stats = await getAdminStats();
  
  // Fetch recent 5 orders
  const recentOrdersData = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  const recentOrders = recentOrdersData.map((order) => ({
    id: order.id,
    customer: order.user?.name || order.firstName + " " + order.lastName,
    status: order.status === "PAID" ? "Completed" as const : order.status === "PENDING" ? "Pending" as const : "Cancelled" as const,
    amount: `$${(order.total / 100).toFixed(2)}`,
    date: new Date(order.createdAt).toLocaleDateString(),
  }));

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
          value={`$${(stats.totalRevenue / 100).toFixed(2)}`}
          change="+12.5%"
          icon={<TrendingUp size={24} className="text-blue-500" />}
        />
        <StatCard
          title="Orders Today"
          value={stats.todayOrders.toString()}
          change="+8.2%"
          icon={<ShoppingCart size={24} className="text-cyan-500" />}
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts.toString()}
          change="+2.1%"
          icon={<Package size={24} className="text-indigo-500" />}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toString()}
          change="+18.7%"
          icon={<UsersIcon size={24} className="text-purple-500" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recent Orders
        </h2>
        {recentOrders.length > 0 ? (
          <Table columns={orderColumns} data={recentOrders} />
        ) : (
          <p className="text-center text-slate-500 py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}
