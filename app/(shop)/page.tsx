import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";
import { getStoreSettings } from "@/lib/store-settings";
import { getProducts } from "../actions/product.actions";
import { getDepartments } from "../actions/departments.actions";

export default async function ShopPage() {
  const products = await getProducts();
  const departments = await getDepartments();
  const storeSettings = await getStoreSettings();
  const NewThisWeekProducts = products.slice(-6);
  const newProducts = products.slice(0, 9);
  const collectionLabel = storeSettings.homeCollectionLabel;

  return (
    <>
      <NewCollectionHero
        products={newProducts}
        departments={departments}
        collectionLabel={collectionLabel}
      />
      <NewThisWeek products={NewThisWeekProducts} />
      <CollectionsGrid products={newProducts} departments={departments} />
      <OurApproach />
      <LandingMinimal />
    </>
  );
}
