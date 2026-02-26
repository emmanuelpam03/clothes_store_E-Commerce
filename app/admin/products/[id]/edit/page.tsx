import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProductBySlugAdmin } from "@/app/actions/admin.actions";
import EditProductForm from "./EditProductForm";
// import EditProductForm from "@/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    notFound();
  }

  const { id: slug } = await params;
  const product = await getProductBySlugAdmin(slug);

  return <EditProductForm product={product} />;
}
