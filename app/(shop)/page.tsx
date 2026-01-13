"use client"

import { CollectionsGrid } from "@/components/shop/CollectionsGrid";
import { LandingMinimal } from "@/components/shop/LandingMinimal";
import { NewCollectionHero } from "@/components/shop/NewCollectionHero";
import { NewThisWeek } from "@/components/shop/NewThisWeek";
import { OurApproach } from "@/components/shop/OurApproach";
// import { useEffect } from "react";
// import { toast } from "sonner";

export default function ShopPage() {
  // useEffect(() => {
  //   const cookie = document.cookie
  //     .split("; ")
  //     .find((c) => c.startsWith("flash="));

  //   if (cookie) {
  //     const message = decodeURIComponent(cookie.split("=")[1]);
  //     toast.success(message);

  //     // delete flash immediately
  //     document.cookie = "flash=; Max-Age=0; path=/";
  //   }
  // }, []);
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
