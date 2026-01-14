"use client"

import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";


export default function ShopPage() {
  

  return (
    <>
      <NewCollectionHero />
      <NewThisWeek />
      <CollectionsGrid />
      <OurApproach />
      <LandingMinimal />
    </>
  );
}
