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
    category?: string;
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
  let query = params.q?.trim();
  let category = params.category?.trim();
  const selectedFilter = params.filter?.trim();

  // Backward compatibility: treat old category links that used `q=` as a category.
  if (!category && query) {
    const normalized = query.trim().toLowerCase();
    if (
      normalized === "men" ||
      normalized === "women" ||
      normalized === "kids"
    ) {
      category = normalized;
      query = undefined;
    }
  }

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

  const categories = await getCategories();
  const products = await getProducts({
    query,
    category,
    filter: selectedFilter,
    sizes,
    colors,
    tags,
    collections,
    minPrice: validMinPrice,
    maxPrice: validMaxPrice,
    inStock,
    outOfStock,
  });

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
