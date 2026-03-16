import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProductBySlugAdmin } from "@/app/actions/admin.actions";
import EditProductForm from "@/components/admin/EditProductForm";
import { getCategories } from "@/app/actions/categories.actions";

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

  return <EditProductForm product={product} categories={categories} />;
}
