import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Track your sales performance, customer behavior, and revenue trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Monthly Revenue"
          value="$54,920"
          change="+23.5%"
          icon={<TrendingUp size={24} className="text-green-500" />}
        />
        <StatCard
          title="Average Order Value"
          value="$156.80"
          change="+5.2%"
          icon={<BarChart3 size={24} className="text-blue-500" />}
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change="-0.8%"
          icon={<TrendingDown size={24} className="text-orange-500" />}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Performance Chart
        </h2>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p className="text-slate-500">Chart visualization coming soon</p>
        </div>
      </div>
    </div>
  );
}
