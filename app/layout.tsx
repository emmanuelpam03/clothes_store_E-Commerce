import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart/cart";
import { FavoritesProvider } from "@/lib/favorites/FavoritesProvider";
import { SessionProvider } from "next-auth/react";
import CartAuthSync from "@/lib/cart/CartAuthSync";
import { headers } from "next/headers";
import { getStoreSettings } from "@/lib/store-settings";
import { StoreSettingsProvider } from "@/lib/store-settings-client";
import { config } from "@/constants/config";
import { getFxRate } from "@/lib/fx";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "XIV",
  description: "Fashion & Design",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reason = (await headers()).get("x-not-found-reason");
  const storeSettings = await getStoreSettings();

  const baseCurrency = config.pricingCurrency ?? "USD";
  let fxRate = 1;

  try {
    fxRate = await getFxRate(baseCurrency, storeSettings.currency);
  } catch (error) {
    console.error("Failed to fetch FX rate:", error);
    fxRate = 1;
  }
  return (
    <html lang="en" className="no-scrollbar overflow-y-scroll">
      <head>
        {reason && <meta name="x-not-found-reason" content={reason} />}
      </head>
      <body className={`${inter.variable} ${interTight.variable} antialiased`}>
        <StoreSettingsProvider
          value={{
            currency: storeSettings.currency,
            sizeSystem: storeSettings.sizeSystem,
            baseCurrency,
            fxRate,
          }}
        >
          <SessionProvider>
            <CartProvider>
              <FavoritesProvider>
                <CartAuthSync />
                {children}
              </FavoritesProvider>
            </CartProvider>
            <Toaster richColors position="top-right" />
          </SessionProvider>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
