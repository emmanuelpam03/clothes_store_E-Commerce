import {
  TrendingUp,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";
import Image from "next/image";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import { auth } from "@/lib/auth";
import { formatCurrencyFromCentsConverted } from "@/lib/money";
import { getStoreSettingsWithFx } from "@/lib/store-settings-fx";
import { notFound } from "next/navigation";
import {
  getAnalyticsData,
  getTopProducts,
  getRevenueByMonth,
  getCategoryStats,
  getRecentOrders,
  getOrderStatusDistribution,
} from "@/app/actions/analytics.actions";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export default async function AnalyticsPage() {
  noStore(); // Prevent caching of analytics data

  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound(); // hides existence of route
  }

  const { settings: storeSettings, fxRate } = await getStoreSettingsWithFx();
  const currency = storeSettings.currency;

  const formatCurrency = (cents: number) =>
    formatCurrencyFromCentsConverted(cents, currency, fxRate);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Analytics
        </h1>
        <p className="text-slate-600 mt-1">
          Track your sales performance, customer behavior, and revenue trends.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
          Revenue Trend (Last 6 Months)
        </h2>
        <RevenueChart data={revenueByMonth} />
      </div>

      {/* Top Products and Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
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
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 font-bold text-xl sm:text-2xl text-slate-300">
                      #{index + 1}
                    </span>
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name || "Product"}
                        width={48}
                        height={48}
                        className="shrink-0 object-cover rounded"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(product.price || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:block sm:text-right">
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {category.name}
                    </h3>
                    <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                      {formatCurrency(category.revenue)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
          Order Status Distribution
        </h2>
        {orderStatusDistribution.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No order status data available yet
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {orderStatusDistribution.map((statusItem) => (
              <div
                key={statusItem.status}
                className="text-center p-3 sm:p-6 bg-slate-50 rounded-lg"
              >
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
          Recent Orders
        </h2>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              No orders available yet
            </p>
          ) : (
            recentOrders.map((order) => {
              const statusLabel = order.uiStatus ?? order.status;
              const statusClasses =
                statusLabel === "RETURNED"
                  ? "bg-red-100 text-red-700"
                  : statusLabel === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : statusLabel === "SHIPPED"
                      ? "bg-blue-100 text-blue-700"
                      : statusLabel === "PAID"
                        ? "bg-purple-100 text-purple-700"
                        : statusLabel === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700";

              return (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">
                      {order.user?.name || order.email}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.items.length} items •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses}`}
                    >
                      {statusLabel}
                    </span>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
          <Package size={32} className="mb-4 opacity-80" />
          <p className="text-3xl sm:text-4xl font-bold mb-2">
            {analyticsData.totalOrders}
          </p>
          <p className="text-blue-100">Total Orders</p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
          <DollarSign size={32} className="mb-4 opacity-80" />
          <p className="text-3xl sm:text-4xl font-bold mb-2">
            {formatCurrency(analyticsData.totalRevenue)}
          </p>
          <p className="text-green-100">All-Time Revenue</p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
          <TrendingUp size={32} className="mb-4 opacity-80" />
          <p className="text-3xl sm:text-4xl font-bold mb-2">
            {formatCurrency(analyticsData.allTimeAverageOrderValue)}
          </p>
          <p className="text-purple-100">Avg Order Value</p>
        </div>
      </div>
    </div>
  );
}
