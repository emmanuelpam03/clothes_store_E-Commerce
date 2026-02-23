export const dynamic = "force-dynamic";

import { getCategories } from "@/app/actions/categories.actions";
import { getProducts } from "@/app/actions/product.actions";
import ProductsPageComponent from "@/components/shop/ProductsPage";

// Helper function to parse array from search params
function parseArray(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  return value.split(",").filter(Boolean);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sizes?: string;
    colors?: string;
    tags?: string;
    collections?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    outOfStock?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim();
  const selectedFilter = params.filter?.trim();

  // Parse filter parameters
  const sizes = parseArray(params.sizes);
  const colors = parseArray(params.colors);
  const tags = parseArray(params.tags);
  const collections = parseArray(params.collections);

  // Validate price parameters to avoid NaN
  const parsedMinPrice = params.minPrice ? Number(params.minPrice) : NaN;
  const parsedMaxPrice = params.maxPrice ? Number(params.maxPrice) : NaN;
  const validMinPrice = !Number.isNaN(parsedMinPrice)
    ? parsedMinPrice
    : undefined;
  const validMaxPrice = !Number.isNaN(parsedMaxPrice)
    ? parsedMaxPrice
    : undefined;

  const inStock = params.inStock === "true";
  const outOfStock = params.outOfStock === "true";

  const [products, categories] = await Promise.all([
    getProducts({
      query,
      filter: selectedFilter,
      sizes,
      colors,
      tags,
      collections,
      minPrice: validMinPrice,
      maxPrice: validMaxPrice,
      inStock,
      outOfStock,
    }),
    getCategories(),
  ]);

  return (
    <div>
      <ProductsPageComponent
        query={query}
        filter={selectedFilter}
        products={products}
        categories={categories}
      />
    </div>
  );
}
