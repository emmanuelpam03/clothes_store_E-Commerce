import { getProducts } from "@/app/actions/product.actions";
import { getUserFavorites } from "@/app/actions/favorite.actions";
import ProductsPageComponent from "@/components/shop/ProductsPage";

export default async function ProductsPage() {
  const products = await getProducts();
  const favoriteIds = await getUserFavorites();
  
  return (
    <div>
      <ProductsPageComponent products={products} initialFavoriteIds={favoriteIds} />
    </div>
  );
}
