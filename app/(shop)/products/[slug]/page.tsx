import { getProductBySlug } from "@/app/actions/product.actions";
import ProductInfo from "@/components/shop/ProductInfo";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <ProductInfo product={product} />
    </div>
  );
}
