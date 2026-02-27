import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import {
  getAnalyticsData,
  getTopProducts,
  getRevenueByMonth,
  getCategoryStats,
  getRecentOrders,
  getOrderStatusDistribution,
} from "@/app/actions/analytics.actions";

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound(); // hides existence of route
  }

  // Fetch all analytics data in parallel
  const [
    analyticsData,
    topProducts,
    revenueByMonth,
    categoryStats,
    recentOrders,
    orderStatusDistribution,
  ] = await Promise.all([
    getAnalyticsData(),
    getTopProducts(5),
    getRevenueByMonth(6),
    getCategoryStats(),
    getRecentOrders(5),
    getOrderStatusDistribution(),
  ]);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Track your sales performance, customer behavior, and revenue trends.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(analyticsData.currentMonthRevenue)}
          change={formatChange(analyticsData.revenueChange)}
          icon={<DollarSign size={24} className="text-green-500" />}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(analyticsData.averageOrderValue)}
          change={formatChange(analyticsData.avgOrderValueChange)}
          icon={<BarChart3 size={24} className="text-blue-500" />}
        />
        <StatCard
          title="Monthly Orders"
          value={analyticsData.currentMonthOrdersCount.toString()}
          change={formatChange(analyticsData.ordersChange)}
          icon={<ShoppingCart size={24} className="text-purple-500" />}
        />
        <StatCard
          title="Total Customers"
          value={analyticsData.totalCustomers.toString()}
          icon={<Users size={24} className="text-orange-500" />}
        />
      </div>

      {/* Revenue by Month Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Revenue Trend (Last 6 Months)
        </h2>
        <RevenueChart data={revenueByMonth} />
      </div>

      {/* Top Products and Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Top Selling Products
          </h2>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No sales data available yet
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-2xl text-slate-300">
                      #{index + 1}
                    </span>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name || "Product"}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(product.price || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {product.totalSold}
                    </p>
                    <p className="text-xs text-slate-600">units sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Category Performance
          </h2>
          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No category data available yet
              </p>
            ) : (
              categoryStats.map((category) => (
                <div key={category.name} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {category.name}
                    </h3>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>{category.itemsSold} sold</span>
                    <span>•</span>
                    <span>{category.productCount} products</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Order Status Distribution
        </h2>
        {orderStatusDistribution.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No order status data available yet
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {orderStatusDistribution.map((statusItem) => (
              <div
                key={statusItem.status}
                className="text-center p-6 bg-slate-50 rounded-lg"
              >
                <p className="text-3xl font-bold text-slate-900">
                  {statusItem.count}
                </p>
                <p className="text-sm text-slate-600 mt-2 capitalize">
                  {statusItem.status.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No orders available yet
            </p>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {order.user.name || order.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    {order.items.length} items •{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.status === "SHIPPED"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "PAID"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white">
          <Package size={32} className="mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">{analyticsData.totalOrders}</p>
          <p className="text-blue-100">Total Orders</p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-8 text-white">
          <DollarSign size={32} className="mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">
            {formatCurrency(analyticsData.totalRevenue)}
          </p>
          <p className="text-green-100">All-Time Revenue</p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white">
          <TrendingUp size={32} className="mb-4 opacity-80" />
          <p className="text-4xl font-bold mb-2">
            {formatCurrency(analyticsData.averageOrderValue)}
          </p>
          <p className="text-purple-100">Avg Order Value</p>
        </div>
      </div>
    </div>
  );
}
