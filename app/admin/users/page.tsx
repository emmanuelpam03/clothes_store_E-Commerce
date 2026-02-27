import Table, { Column } from "@/components/admin/Table";
import UserActions from "@/components/admin/UserActions";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getAllUsersAdmin } from "@/app/actions/admin.actions";

type UserRole = "USER" | "ADMIN";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orders: number;
  joinDate: string;
  actions: {
    userId: string;
    currentRole: UserRole;
    isCurrentUser: boolean;
  };
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRoleBadge(role: UserRole) {
  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${
        role === "ADMIN"
          ? "bg-purple-100 text-purple-700"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      {role}
    </span>
  );
}

const columns: Column<User>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "role",
    label: "Role",
    render: (v) => getRoleBadge(v as UserRole),
  },
  { key: "orders", label: "Orders" },
  { key: "joinDate", label: "Join Date" },
  {
    key: "actions",
    label: "Actions",
    render: (v) => {
      const actions = v as User["actions"];
      return (
        <UserActions
          userId={actions.userId}
          currentRole={actions.currentRole}
          isCurrentUser={actions.isCurrentUser}
        />
      );
    },
  },
];

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound(); // hides existence of route
  }

  const dbUsers = await getAllUsersAdmin();

  const users: User[] = dbUsers.map((user) => ({
    id: user.id,
    name: user.name || "No name",
    email: user.email || "No email",
    role: user.role,
    orders: user._count.orders,
    joinDate: user.emailVerified
      ? formatDate(user.emailVerified)
      : "Not verified",
    actions: {
      userId: user.id,
      currentRole: user.role,
      isCurrentUser: user.id === session.user.id,
    },
  }));

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600 mt-1">
          Manage your customer base and track their activity.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        {users.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No users found.
          </div>
        ) : (
          <Table columns={columns} data={users} />
        )}
      </div>
    </div>
  );
}
