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
    const rows = await prisma.$queryRaw<StoreSettingsRow[]>`
      SELECT
        brand_name AS "brandName",
        support_email AS "supportEmail",
        currency,
        size_system AS "sizeSystem",
        shipping_origin AS "shippingOrigin",
        shipping_cost_cents AS "shippingCostCents",
        free_shipping_threshold_cents AS "freeShippingThresholdCents",
        low_stock_threshold AS "lowStockThreshold",
        return_window_days AS "returnWindowDays"
      FROM store_settings
      WHERE id = 'default'
      LIMIT 1
    `;

    if (rows.length === 0) {
      return defaultStoreSettings;
    }

    return rows[0];
  } catch {
    return defaultStoreSettings;
  }
}
