import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";
import { getProducts } from "../actions/product.actions";
import { getCategories } from "../actions/categories.actions";

export default async function ShopPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const NewThisWeekProducts = products.slice(-6);
  const newProducts = products.slice(0, 9);

  return (
    <>
      <NewCollectionHero products={newProducts} categories={categories} />
      <NewThisWeek products={NewThisWeekProducts} />
      <CollectionsGrid products={newProducts} categories={categories} />
      <OurApproach />
      <LandingMinimal />
    </>
  );
}
