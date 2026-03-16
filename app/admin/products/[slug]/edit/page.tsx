import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProductBySlugAdmin } from "@/app/actions/admin.actions";
import EditProductForm from "@/components/admin/EditProductForm";
import { getCategories } from "@/app/actions/categories.actions";
import { getCollections } from "@/app/actions/collections.actions";
import { getDepartments } from "@/app/actions/departments.actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const { slug } = await params;
  const product = await getProductBySlugAdmin(slug);

  const categories = await getCategories();
  const departments = await getDepartments();
  const collections = await getCollections();

  return (
    <EditProductForm
      product={product}
      categories={categories}
      departments={departments}
      collections={collections}
    />
  );
}
