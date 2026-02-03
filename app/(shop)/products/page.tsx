import { getProducts } from "@/app/actions/product.actions";
import ProductsPageComponent from "@/components/shop/ProductsPage";

export default async function ProductsPage() {
  const products = await getProducts()
  return (
    <div>
      <ProductsPageComponent products = {products} />
    </div>
  );
}
