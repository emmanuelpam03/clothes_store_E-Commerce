import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getUserByIdAdmin } from "@/app/actions/admin.actions";
import UserActions from "@/components/admin/UserActions";
import Link from "next/link";

type UserRole = "USER" | "ADMIN";

interface PageProps {
  params: Promise<{ userId: string }>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getRoleBadge(role: UserRole) {
  return (
    <span
      className={`text-sm font-semibold px-4 py-2 rounded-full ${
        role === "ADMIN"
          ? "bg-purple-100 text-purple-700"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {role}
    </span>
  );
}

export default async function UserDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const { userId } = await params;
  const user = await getUserByIdAdmin(userId);

  if (!user) {
    notFound();
  }

  const isCurrentUser = user.id === session.user.id;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/users"
            className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block"
          >
            ← Back to Users
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">User Details</h1>
          <p className="text-slate-600 mt-1">
            {user.name || "Unnamed User"} ({user.email})
          </p>
        </div>
        <div className="flex items-center gap-4">
          {getRoleBadge(user.role)}
          <UserActions
            userId={user.id}
            currentRole={user.role}
            isCurrentUser={isCurrentUser}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Recent Orders ({user._count.orders} total)
            </h2>
            {user.orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No orders yet
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        Order #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(order.total)}
                      </div>
                      <div
                        className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : order.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Activity Timeline
            </h2>
            <div className="space-y-4">
              {user.emailVerified && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Email Verified
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(user.emailVerified)}
                    </div>
                  </div>
                </div>
              )}
              {user.orders.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      First Order
                    </div>
                    <div className="text-sm text-slate-600">
                      {formatDate(
                        user.orders[user.orders.length - 1].createdAt,
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Information
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">User ID</div>
                <div className="font-mono text-sm text-slate-900">
                  {user.id}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Name</div>
                <div className="font-semibold text-slate-900">
                  {user.name || "Not set"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-semibold text-slate-900">
                  {user.email || "Not set"}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Role</div>
                <div className="font-semibold text-slate-900">{user.role}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Email Verified</div>
                <div className="font-semibold text-slate-900">
                  {user.emailVerified ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Orders</span>
                <span className="font-semibold text-slate-900">
                  {user._count.orders}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Favorites</span>
                <span className="font-semibold text-slate-900">
                  {user._count.favorites}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Spent</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(
                    user.orders.reduce((sum, order) => sum + order.total, 0),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
