import StatCard from "@/components/admin/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="$18,240" />
        <StatCard title="Orders Today" value="48" />
        <StatCard title="Active Products" value="126" />
        <StatCard title="Users" value="1,394" />
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <p className="text-gray-500">Orders table goes here</p>
      </div>
    </div>
  );
}
