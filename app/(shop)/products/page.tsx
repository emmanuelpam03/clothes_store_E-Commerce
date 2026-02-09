export const dynamic = "force-dynamic";

import { getProducts } from "@/app/actions/product.actions";
import ProductsPageComponent from "@/components/shop/ProductsPage";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();
  const products = await getProducts(query);

  return (
    <div>
      <ProductsPageComponent query={query} products={products} />
    </div>
  );
}
