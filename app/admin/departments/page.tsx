export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getDepartments } from "@/app/actions/departments.actions";
import DepartmentsManager from "@/components/admin/DepartmentsManager";

export default async function AdminDepartmentsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const departments = await getDepartments();

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Departments</h1>
        <p className="text-slate-600 mt-1">
          Create and manage storefront departments (e.g. Men, Women, Kids).
        </p>
      </div>

      <DepartmentsManager initialDepartments={departments} />
    </div>
  );
}
