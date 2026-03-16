export type SlugifyOptions = {
  /**
   * Lowercase output.
   * Defaults to true.
   */
  lower?: boolean;

  /**
   * If provided, trims the resulting slug to this length.
   * Trimming is done after slug creation and then trailing dashes are removed.
   */
  maxLength?: number;
};

// A small, dependency-free slug generator intended for URLs.
// - Removes diacritics (e.g. "Café" -> "cafe")
// - Normalizes punctuation (smart quotes, em dashes)
// - Converts "&" to "and"
// - Collapses runs of separators into single "-"
export function slugify(input: string, options: SlugifyOptions = {}): string {
  const { lower = true, maxLength } = options;

  let value = input.trim();
  if (!value) return "";

  // Normalize common punctuation and symbols up-front.
  value = value
    .replace(/[’']/g, "")
    .replace(/[“”"]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/&/g, " and ")
    .replace(/_/g, "-");

  if (lower) {
    value = value.toLowerCase();
  }

  // Handle a few common non-ascii letters that aren't decomposed by NFKD.
  value = value
    .replace(/ß/g, "ss")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/ø/g, "o")
    .replace(/đ/g, "d")
    .replace(/ł/g, "l")
    .replace(/þ/g, "th");

  // Strip diacritics.
  value = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  // Replace any non-alphanumeric sequences with a single dash.
  value = value
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (
    typeof maxLength === "number" &&
    maxLength > 0 &&
    value.length > maxLength
  ) {
    value = value.slice(0, maxLength).replace(/-+$/g, "");
  }

  return value;
}
