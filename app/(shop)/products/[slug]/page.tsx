import { getProductBySlug } from "@/app/actions/product.actions";
import ProductInfo from "@/components/shop/ProductInfo";
import ProductInfoSkeleton from "@/components/shop/skeleton/ProductInfoSkeleton";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
      <Suspense fallback={<ProductInfoSkeleton />}>
        <ProductInfo product={product} />
      </Suspense>
    </div>
  );
}
