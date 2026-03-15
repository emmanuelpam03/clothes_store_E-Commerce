export type CurrencyFormatOptions = {
  currency: string;
  locale?: string;
};

const formatterCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter({ currency, locale }: CurrencyFormatOptions) {
  const safeCurrency = currency?.trim() ? currency.trim().toUpperCase() : "USD";
  const safeLocale = locale ?? "en-US";
  const cacheKey = `${safeLocale}::${safeCurrency}`;

  const cached = formatterCache.get(cacheKey);
  if (cached) return cached;

  const created = new Intl.NumberFormat(safeLocale, {
    style: "currency",
    currency: safeCurrency,
  });
  formatterCache.set(cacheKey, created);
  return created;
}

export function formatCurrencyFromCents(
  cents: number,
  currency: string = "USD",
  locale?: string,
): string {
  const amount = Number.isFinite(cents) ? cents / 100 : 0;
  return getCurrencyFormatter({ currency, locale }).format(amount);
}

export function formatCurrencyCompactFromCents(
  cents: number,
  currency: string = "USD",
  locale?: string,
): string {
  const safeCurrency = currency?.trim() ? currency.trim().toUpperCase() : "USD";
  const safeLocale = locale ?? "en-US";
  const amount = Number.isFinite(cents) ? cents / 100 : 0;

  return new Intl.NumberFormat(safeLocale, {
    style: "currency",
    currency: safeCurrency,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(amount);
}
