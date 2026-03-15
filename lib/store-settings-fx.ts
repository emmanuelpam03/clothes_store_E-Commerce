import { config } from "@/constants/config";
import { getFxRate } from "@/lib/fx";
import {
  getStoreSettings,
  type StoreSettingsRuntime,
} from "@/lib/store-settings";

export type StoreSettingsWithFx = {
  settings: StoreSettingsRuntime;
  baseCurrency: string;
  fxRate: number;
};

export async function getStoreSettingsWithFx(): Promise<StoreSettingsWithFx> {
  const settings = await getStoreSettings();
  const baseCurrency = config.pricingCurrency ?? "USD";

  try {
    const fxRate = await getFxRate(baseCurrency, settings.currency);
    return { settings, baseCurrency, fxRate };
  } catch (error) {
    console.error(
      `Failed to fetch FX rate for ${baseCurrency} → ${settings.currency}:`,
      error,
    );
    if (baseCurrency === settings.currency) {
      return { settings, baseCurrency, fxRate: 1 };
    }
    throw error;
  }
}
