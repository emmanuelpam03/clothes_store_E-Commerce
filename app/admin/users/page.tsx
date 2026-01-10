import Table, { Column } from "@/components/admin/Table";
import { Users } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  orders: number;
  joinDate: string;
};

const customers: User[] = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane@email.com",
    status: "Active",
    orders: 12,
    joinDate: "2023-06-15",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@email.com",
    status: "Active",
    orders: 5,
    joinDate: "2023-08-20",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah@email.com",
    status: "Inactive",
    orders: 3,
    joinDate: "2023-03-10",
  },
];

const columns: Column<User>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span
        className={`text-xs font-semibold px-3 py-1 rounded-full ${
          v === "Active"
            ? "bg-green-100 text-green-700"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {String(v)}
      </span>
    ),
  },
  { key: "orders", label: "Orders" },
  { key: "joinDate", label: "Join Date" },
];

export default function UsersPage() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Users</h1>
        <p className="text-slate-600 mt-1">
          Manage your customer base and track their activity.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <Table columns={columns} data={customers} />
      </div>
    </div>
  );
}
