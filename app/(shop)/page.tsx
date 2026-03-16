import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";
import { getStoreSettings } from "@/lib/store-settings";
import prisma from "@/lib/prisma";
import { getProducts } from "../actions/product.actions";
import { getDepartments } from "../actions/departments.actions";

export default async function ShopPage() {
  const departments = await getDepartments();
  const storeSettings = await getStoreSettings();

  const homeCollection = storeSettings.homeCollectionId
    ? await prisma.collection.findUnique({
        where: { id: storeSettings.homeCollectionId },
        select: { id: true, name: true },
      })
    : null;

  const collectionLabel = homeCollection?.name ?? null;

  const heroProducts = homeCollection
    ? await prisma.product.findMany({
        where: {
          active: true,
          isFeatured: true,
          image: { not: null },
          collectionId: homeCollection.id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          slug: true,
        },
        orderBy: { createdAt: "desc" },
        take: 9,
      })
    : [];

  const products = await getProducts();
  const NewThisWeekProducts = products.slice(-6);
  const newProducts = products.slice(0, 9);

  return (
    <>
      <NewCollectionHero
        products={heroProducts}
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
