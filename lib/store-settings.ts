import prisma from "@/lib/prisma";
import { config } from "@/constants/config";

export type StoreSettingsRuntime = {
  brandName: string;
  supportEmail: string;
  currency: string;
  sizeSystem: string;
  shippingOrigin: string;
  shippingCostCents: number;
  freeShippingThresholdCents: number;
  lowStockThreshold: number;
  returnWindowDays: number;
};

export const defaultStoreSettings: StoreSettingsRuntime = {
  brandName: config.appName,
  supportEmail: "support@clothesstore.com",
  currency: "USD",
  sizeSystem: "US",
  shippingOrigin: "United States",
  shippingCostCents: config.shippingCostCents,
  freeShippingThresholdCents: config.freeShippingThresholdCents,
  lowStockThreshold: config.lowStockThreshold,
  returnWindowDays: config.returnWindowDays,
};

type StoreSettingsRow = {
  brandName: string;
  supportEmail: string;
  currency: string;
  sizeSystem: string;
  shippingOrigin: string;
  shippingCostCents: number;
  freeShippingThresholdCents: number;
  lowStockThreshold: number;
  returnWindowDays: number;
};

export async function getStoreSettings(): Promise<StoreSettingsRuntime> {
  try {
    const row = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: {
        brandName: true,
        supportEmail: true,
        currency: true,
        sizeSystem: true,
        shippingOrigin: true,
        shippingCostCents: true,
        freeShippingThresholdCents: true,
        lowStockThreshold: true,
        returnWindowDays: true,
      },
    });

    if (!row) {
      return defaultStoreSettings;
    }

    return row as StoreSettingsRow;
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return defaultStoreSettings;
  }
}
