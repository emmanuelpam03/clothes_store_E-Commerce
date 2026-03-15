type FxApiResponse = {
  result?: string;
  rates?: Record<string, number>;
};

const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000; // 6h

type CachedRates = {
  fetchedAt: number;
  base: string;
  rates: Record<string, number>;
};

function normalizeCurrency(code: string) {
  const trimmed = code?.trim();
  return trimmed ? trimmed.toUpperCase() : "USD";
}

function getCacheKey(base: string) {
  return `__fx_rates__${base}`;
}

function getCachedRates(base: string): CachedRates | null {
  const key = getCacheKey(base);
  const record = (globalThis as unknown as Record<string, unknown>)[key] as
    | CachedRates
    | undefined;

  if (!record) return null;
  if (record.base !== base) return null;
  if (!record.fetchedAt || !record.rates) return null;
  if (Date.now() - record.fetchedAt > DEFAULT_TTL_MS) return null;

  return record;
}

function setCachedRates(base: string, rates: Record<string, number>) {
  const key = getCacheKey(base);
  (globalThis as unknown as Record<string, unknown>)[key] = {
    fetchedAt: Date.now(),
    base,
    rates,
  } satisfies CachedRates;
}

async function fetchRates(
  baseCurrency: string,
): Promise<Record<string, number>> {
  // Free endpoint (no API key). If you want a provider with an API key,
  // you can swap this URL and keep the rest of the code.
  const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(
    baseCurrency,
  )}`;

  const res = await fetch(url, {
    // Cache on the Next.js side as well.
    next: { revalidate: 60 * 60 },
  });

  if (!res.ok) {
    throw new Error(`FX rates request failed: ${res.status}`);
  }

  const data = (await res.json()) as FxApiResponse;
  if (!data?.rates || typeof data.rates !== "object") {
    throw new Error("FX rates response missing rates");
  }

  return data.rates;
}

export async function getFxRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<number> {
  const base = normalizeCurrency(fromCurrency);
  const target = normalizeCurrency(toCurrency);

  if (base === target) return 1;

  const cached = getCachedRates(base);
  if (cached?.rates?.[target] && Number.isFinite(cached.rates[target])) {
    return cached.rates[target];
  }

  const rates = await fetchRates(base);
  setCachedRates(base, rates);

  const rate = rates[target];
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`FX rate not available for ${base}->${target}`);
  }

  return rate;
}

export function convertCentsWithRate(cents: number, rate: number): number {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 1;
  return Math.round(safeCents * safeRate);
}
