export type StoredColor = {
  name: string;
  value: string;
};

export type ResolvedStoredColor = StoredColor & {
  /** A safe CSS color value for swatches (usually a hex string). */
  swatch?: string;
};

// Shared palette used across admin + shop.
// NOTE: Keep values as valid CSS colors (hex).
export const PREDEFINED_COLORS = [
  { name: "Black", value: "#111827" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#9ca3af" },
  { name: "Light Gray", value: "#d1d5db" },
  { name: "Dark Gray", value: "#4b5563" },
  { name: "Navy", value: "#1e3a8a" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Sky Blue", value: "#0ea5e9" },
  { name: "Light Blue", value: "#bfdbfe" },
  { name: "Royal Blue", value: "#1e40af" },
  { name: "Red", value: "#ef4444" },
  { name: "Dark Red", value: "#dc2626" },
  { name: "Burgundy", value: "#7f1d1d" },
  { name: "Pink", value: "#ec4899" },
  { name: "Light Pink", value: "#fbcfe8" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Green", value: "#22c55e" },
  { name: "Dark Green", value: "#15803d" },
  { name: "Olive", value: "#84cc16" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Purple", value: "#a855f7" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Lavender", value: "#c4b5fd" },
  { name: "Yellow", value: "#facc15" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Coral", value: "#fb7185" },
  { name: "Brown", value: "#92400e" },
  { name: "Tan", value: "#d97706" },
  { name: "Beige", value: "#d6d3d1" },
  { name: "Cream", value: "#fef3c7" },
  { name: "Ivory", value: "#fffbeb" },
  { name: "Mint", value: "#d1fae5" },
  { name: "Peach", value: "#fed7aa" },
  { name: "Lilac", value: "#e9d5ff" },
  { name: "Khaki", value: "#a8a29e" },
  { name: "Charcoal", value: "#374151" },
] as const;

const normalizeColorNameKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    // collapse spaces / punctuation so e.g. "Light Blue" and "lightblue" match
    .replace(/[^a-z0-9]+/g, "");

const NAMED_COLOR_TO_HEX = new Map<string, string>(
  PREDEFINED_COLORS.map((c) => [normalizeColorNameKey(c.name), c.value]),
);

// Bidirectional grey <-> gray alias.
const grayHex = NAMED_COLOR_TO_HEX.get("gray");
const greyHex = NAMED_COLOR_TO_HEX.get("grey");
if (grayHex && !greyHex) NAMED_COLOR_TO_HEX.set("grey", grayHex);
if (greyHex && !grayHex) NAMED_COLOR_TO_HEX.set("gray", greyHex);

// Also alias lightgray <-> lightgrey and darkgray <-> darkgrey variants.
for (const [key, value] of Array.from(NAMED_COLOR_TO_HEX.entries())) {
  if (key.includes("gray")) {
    const altKey = key.replace("gray", "grey");
    if (!NAMED_COLOR_TO_HEX.has(altKey)) NAMED_COLOR_TO_HEX.set(altKey, value);
  } else if (key.includes("grey")) {
    const altKey = key.replace("grey", "gray");
    if (!NAMED_COLOR_TO_HEX.has(altKey)) NAMED_COLOR_TO_HEX.set(altKey, value);
  }
}

/**
 * Parse a stored color string into name + value.
 *
 * Supported formats:
 * - "Name#RRGGBB" (current)
 * - "Name:#RRGGBB" (legacy)
 * - "Name:#RRGGBB " (tolerates whitespace)
 * - "Name:RRGGBB" (legacy/malformed: missing '#')
 * - "Name (#RRGGBB)" / "Name #RRGGBB" (messy legacy)
 * - "Name (RRGGBB)" (messy legacy: missing '#')
 * - "#RRGGBB" (no name)
 * - "Name" (name-only)
 */
export const parseStoredColor = (color: string): StoredColor => {
  const raw = color ?? "";
  const trimmed = raw.trim();

  if (!trimmed) {
    return { name: "", value: "" };
  }

  const cleanName = (value: string) =>
    value
      .replace(/[()\[\]{}]+/g, " ")
      .replace(/[,:\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  // 1) Extract the last explicit '#hex' token anywhere in the string.
  // This handles formats like "Black (#111827)" and names containing '#'.
  const hashMatches = Array.from(
    trimmed.matchAll(
      /#([0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{3})/g,
    ),
  );

  if (hashMatches.length > 0) {
    const last = hashMatches[hashMatches.length - 1];
    const index = last.index ?? 0;
    const rawToken = last[0];
    const value = rawToken;

    const before = trimmed.slice(0, index);
    const after = trimmed.slice(index + rawToken.length);
    const nameCandidate = cleanName(`${before} ${after}`);
    return { name: nameCandidate || value, value };
  }

  // 2) Extract the last 6/8-digit hex token without '#', using word boundaries.
  // This handles formats like "Black (111827)".
  const bareMatches = Array.from(
    trimmed.matchAll(/\b([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g),
  );
  if (bareMatches.length > 0) {
    const last = bareMatches[bareMatches.length - 1];
    const index = last.index ?? 0;
    const rawToken = last[1];
    const value = `#${rawToken}`;

    const before = trimmed.slice(0, index);
    const after = trimmed.slice(index + rawToken.length);
    const nameCandidate = cleanName(`${before} ${after}`);
    return { name: nameCandidate || value, value };
  }

  // Legacy / malformed: "Name:hex" (missing '#')
  if (trimmed.includes(":")) {
    const lastColonIndex = trimmed.lastIndexOf(":");
    const name = trimmed.substring(0, lastColonIndex).trim();
    const value = trimmed.substring(lastColonIndex + 1).trim();
    return { name: name || value, value };
  }

  return { name: trimmed, value: trimmed };
};

/** Normalizes hex colors with or without a leading '#'. */
export const normalizeHexColor = (value: string): string | null => {
  const trimmed = value.trim();
  const match = trimmed.match(
    /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  );
  if (!match) return null;
  return `#${match[1].toLowerCase()}`;
};

/**
 * Resolves a stored color into a safe swatch color.
 *
 * - Prefers explicit hex values (even if missing '#').
 * - Falls back to known named colors from PREDEFINED_COLORS.
 */
export const resolveStoredColor = (color: string): ResolvedStoredColor => {
  const parsed = parseStoredColor(color);

  const normalizedHex = normalizeHexColor(parsed.value);
  if (normalizedHex) {
    return { ...parsed, swatch: normalizedHex };
  }

  const keyValue = normalizeColorNameKey(parsed.value);
  const keyName = normalizeColorNameKey(parsed.name);
  const mapped =
    NAMED_COLOR_TO_HEX.get(keyValue) ?? NAMED_COLOR_TO_HEX.get(keyName);

  if (mapped) {
    return { ...parsed, swatch: mapped };
  }

  return parsed;
};

/**
 * Formats a color for storage.
 * - Returns "Name<value>" when a name is provided.
 * - Returns "<value>" when the name is missing or equals the value.
 *
 * Note: This function intentionally does NOT validate or normalize `value`.
 * It simply concatenates the tokens to match the existing DB storage format.
 */
export const formatStoredColor = (name: string, value: string): string => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const trimmedName = name.trim();
  if (!trimmedName || trimmedName === trimmedValue) return trimmedValue;
  return `${trimmedName}${trimmedValue}`;
};
