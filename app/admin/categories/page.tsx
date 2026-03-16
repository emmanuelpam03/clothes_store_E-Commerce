export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getCategories } from "@/app/actions/categories.actions";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-600 mt-1">
          Create and manage product categories.
        </p>
      </div>

      <CategoriesManager initialCategories={categories} />
    </div>
  );
}
