import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";
import { getProducts } from "../actions/product.actions";

export default async function ShopPage() {
  const products = await getProducts();
  const newProducts = products.slice(0, 6);
  const NewThisWeekProducts = products.slice(-9);
  return (
    <>
      <NewCollectionHero products={newProducts} />
      <NewThisWeek products={NewThisWeekProducts} />
      <CollectionsGrid products={newProducts} />
      <OurApproach />
      <LandingMinimal />
    </>
  );
}
