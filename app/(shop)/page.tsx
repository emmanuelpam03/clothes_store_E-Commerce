import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";

export default function ShopPage() {
  return (
    <>
      <NewCollectionHero />
      <NewThisWeek />
      <CollectionsGrid />
    </>
  );
}
