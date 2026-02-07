import { getProductBySlug } from "@/app/actions/product.actions";
import { getUserFavorites } from "@/app/actions/favorite.actions";
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

  const favoriteIds = await getUserFavorites();
  const isFavorited = favoriteIds.includes(product.id);

  return (
    <div>
      <ProductInfo product={product} initialIsFavorited={isFavorited} />
    </div>
  );
}
