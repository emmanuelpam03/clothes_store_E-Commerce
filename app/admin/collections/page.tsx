export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getCollections } from "@/app/actions/collections.actions";
import CollectionsManager from "@/components/admin/CollectionsManager";

export default async function AdminCollectionsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const collections = await getCollections();

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Collections</h1>
        <p className="text-slate-600 mt-1">
          Create and manage seasonal collections (e.g. Spring 2026).
        </p>
      </div>

      <CollectionsManager initialCollections={collections} />
    </div>
  );
}
