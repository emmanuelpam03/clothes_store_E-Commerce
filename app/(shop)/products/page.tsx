export const dynamic = "force-dynamic";

import { getCategories } from "@/app/actions/categories.actions";
import { getProducts } from "@/app/actions/product.actions";
import ProductsPageComponent from "@/components/shop/ProductsPage";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string, filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const query = q?.trim();
  const selectedFilter = filter?.trim();
  // const products = await getProducts(query, selectedFilter);
  const [products, categories] = await Promise.all([
    getProducts(query, selectedFilter),
    getCategories(),
  ]);

  return (
    <div>
      <ProductsPageComponent query={query} filter={selectedFilter} products={products} categories={categories} />
    </div>
  );
}
