export const config = {
  appName: "Clothes Store",
  // Prices in the database are stored in this base currency.
  // When `store_settings.currency` changes, we convert for display using live FX rates.
  pricingCurrency: "USD",
  shippingCostCents: 1000, // $10.00
  freeShippingThresholdCents: 10000, // $100.00
  lowStockThreshold: 10,
  returnWindowDays: 30,
} as const;
