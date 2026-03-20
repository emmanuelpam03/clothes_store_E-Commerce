"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Heart,
  ChevronDown,
  ChevronRight,
  X,
  ShoppingBag,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites/useFavorites";
import ProductsGridSkeleton from "./skeleton/ProductsGridSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect } from "react";
import AddToCartDialog from "./AddToCartDialog";
import { formatCurrencyFromCentsConverted } from "@/lib/money";
import { useStoreSettings } from "@/lib/store-settings-client";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  inventory?: {
    quantity: number;
  } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Department = {
  id: string;
  name: string;
  slug: string;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
};

const MERCH_FILTERS = [
  { label: "FEATURED", slug: "featured" },
  { label: "NEW", slug: "new" },
  { label: "BEST SELLERS", slug: "best-sellers" },
];

export default function ProductsPageComponent({
  products,
  departments,
  categories,
  collections,
}: {
  products: Product[];
  departments: Department[];
  categories: Category[];
  collections: Collection[];
}) {
  const parseStoredColor = (
    color: string,
  ): {
    name: string;
    value: string;
  } => {
    const hashIndex = color.indexOf("#");
    if (hashIndex !== -1) {
      let name = color.substring(0, hashIndex);
      const value = color.substring(hashIndex);
      name = name.replace(/:$/, "");
      if (name) return { name, value };
      return { name: value, value };
    }

    if (color.includes(":")) {
      const lastColonIndex = color.lastIndexOf(":");
      const name = color.substring(0, lastColonIndex);
      const value = color.substring(lastColonIndex + 1);
      return { name, value };
    }

    return { name: color, value: color };
  };

  const isHexColor = (value: string) =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(
    new Set(["Department", "Filter", "Category", "Price Range"]),
  );

  const { currency, fxRate = 1 } = useStoreSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.trim();
  const [inputValue, setInputValue] = useState(rawQuery);
  const [isPending, startTransition] = useTransition();

  // suggestions
  const suggestions = products
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name }));

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(rawQuery);
  }, [rawQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        const current = searchParams.toString();
        const params = new URLSearchParams(current);

        const nextQ = inputValue.trim();
        if (!nextQ) {
          params.delete("q");
        } else {
          params.set("q", nextQ);
        }

        const next = params.toString();
        if (next === current) return;

        router.replace(next ? `/products?${next}` : "/products", {
          scroll: false,
        });
      });
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [inputValue, router, searchParams]);

  const {
    isFavorited,
    toggleFavorite,
    isLoading: isFavoritePending,
  } = useFavorites();

  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);

  // Add state for mobile filters toggle
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Read filter values from URL search params
  const selectedSizes = new Set(
    searchParams.get("sizes")?.split(",").filter(Boolean) || [],
  );
  const selectedColors = new Set(
    searchParams.get("colors")?.split(",").filter(Boolean) || [],
  );
  const selectedTags = new Set(
    searchParams.get("tags")?.split(",").filter(Boolean) || [],
  );

  const selectedCollectionsRaw = searchParams
    .getAll("collections")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    });

  const collectionIdSet = new Set(collections.map((c) => c.id));
  const collectionSlugSet = new Set(collections.map((c) => c.slug));
  const collectionNameSet = new Set(collections.map((c) => c.name));

  const selectedCollections = new Set<string>();

  const parseCollectionToken = (token: string): string | null => {
    const trimmed = token.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("id:")) {
      const id = trimmed.slice("id:".length);
      return collectionIdSet.has(id) ? `id:${id}` : null;
    }
    if (trimmed.startsWith("slug:")) {
      const slug = trimmed.slice("slug:".length);
      return collectionSlugSet.has(slug) ? `slug:${slug}` : null;
    }
    if (trimmed.startsWith("name:")) {
      const name = trimmed.slice("name:".length);
      return collectionNameSet.has(name) ? `name:${name}` : null;
    }

    // Legacy (unprefixed) tokens: accept only if unambiguous.
    const matches: string[] = [];
    if (collectionIdSet.has(trimmed)) matches.push(`id:${trimmed}`);
    if (collectionSlugSet.has(trimmed)) matches.push(`slug:${trimmed}`);
    if (collectionNameSet.has(trimmed)) matches.push(`name:${trimmed}`);

    return matches.length === 1 ? matches[0] : null;
  };

  for (const raw of selectedCollectionsRaw) {
    const parsed = parseCollectionToken(raw);
    if (parsed) selectedCollections.add(parsed);
  }
  const maxPrice = Number(searchParams.get("maxPrice") || "100000"); // Store in cents
  const showInStock = searchParams.get("inStock") === "true";
  const showOutOfStock = searchParams.get("outOfStock") === "true";
  const selectedDepartment = searchParams.get("department") ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedMerchFilter = searchParams.get("filter") ?? "";

  const handleToggleFavorite = async (productId: string) => {
    try {
      const wasFavorited = isFavorited(productId);
      await toggleFavorite(productId);
      toast.success(
        wasFavorited ? "Removed from favorites" : "Added to favorites",
      );
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  // Helper function to update URL with new filters
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.replace(`/products?${params.toString()}`, { scroll: false });
    });
  };

  const updateCollectionsFilter = (next: Set<string>) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("collections");
    if (next.size > 0) {
      for (const token of next) {
        params.append("collections", encodeURIComponent(token));
      }
    }

    startTransition(() => {
      router.replace(`/products?${params.toString()}`, { scroll: false });
    });
  };

  const toggleFilter = (filterName: string) => {
    setExpandedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterName)) {
        next.delete(filterName);
      } else {
        next.add(filterName);
      }
      return next;
    });
  };

  const isExpanded = (filterName: string) => expandedFilters.has(filterName);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxPrice = e.target.value;
    updateFilters({ maxPrice: newMaxPrice });
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  // Helper functions to toggle filters
  const toggleSize = (size: string) => {
    const next = new Set(selectedSizes);
    if (next.has(size)) {
      next.delete(size);
    } else {
      next.add(size);
    }
    updateFilters({
      sizes: next.size > 0 ? Array.from(next).join(",") : undefined,
    });
  };

  const toggleColor = (color: string) => {
    const next = new Set(selectedColors);
    if (next.has(color)) {
      next.delete(color);
    } else {
      next.add(color);
    }
    updateFilters({
      colors: next.size > 0 ? Array.from(next).join(",") : undefined,
    });
  };

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    updateFilters({
      tags: next.size > 0 ? Array.from(next).join(",") : undefined,
    });
  };

  const toggleCollection = (collection: Collection) => {
    const next = new Set(selectedCollections);

    const slugToken = `slug:${collection.slug}`;
    const idToken = `id:${collection.id}`;
    const nameToken = `name:${collection.name}`;

    const isSelected =
      next.has(slugToken) || next.has(idToken) || next.has(nameToken);

    if (isSelected) {
      next.delete(slugToken);
      next.delete(idToken);
      next.delete(nameToken);
    } else {
      // Always persist slug tokens going forward (stable + URL-safe).
      next.add(slugToken);
    }

    updateCollectionsFilter(next);
  };

  const toggleInStock = (checked: boolean) => {
    updateFilters({
      inStock: checked ? "true" : undefined,
      outOfStock: checked
        ? undefined
        : searchParams.get("outOfStock") || undefined,
    });
  };

  const toggleOutOfStock = (checked: boolean) => {
    updateFilters({
      outOfStock: checked ? "true" : undefined,
      inStock: checked ? undefined : searchParams.get("inStock") || undefined,
    });
  };

  // Get unique values from ALL products for filter options (not filtered)
  // Note: In production, you might want to get these from the database
  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes || [])));
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors || [])))
    .filter(Boolean)
    .sort((a, b) =>
      parseStoredColor(a).name.localeCompare(parseStoredColor(b).name),
    );
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags || [])));
  const allCollections = collections;

  // Calculate counts based on CURRENT filtered products
  const inStockCount = products.filter(
    (p) => (p.inventory?.quantity ?? 0) > 0,
  ).length;
  const outOfStockCount = products.filter(
    (p) => (p.inventory?.quantity ?? 0) === 0,
  ).length;

  return (
    <section className="w-full bg-neutral-100 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-xs text-neutral-500">Home / Products</p>

        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-black">
          PRODUCTS
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="relative flex w-full max-w-md">
            <div className="flex items-center gap-3 rounded bg-neutral-200 px-4 py-2 text-sm text-black">
              <Search size={16} />
              <input
                id="product-search"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setInputValue("");
                    setShowSuggestions(false);
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("q");
                    router.replace(`/products?${params.toString()}`, {
                      scroll: false,
                    });
                  }
                }}
                placeholder="Search"
                className="w-full bg-transparent outline-none placeholder:text-neutral-500"
              />
            </div>

            {showSuggestions && inputValue && suggestions.length > 0 && (
              <div className="absolute top-full z-30 mt-1 w-full rounded bg-white shadow border">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setInputValue(s.name);
                      setShowSuggestions(false);
                      const params = new URLSearchParams(
                        searchParams.toString(),
                      );
                      params.set("q", s.name);
                      router.replace(`/products?${params.toString()}`, {
                        scroll: false,
                      });
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-neutral-100"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`flex flex-wrap gap-2 ${
              isMobileFiltersOpen ? "hidden" : "hidden md:flex"
            }`}
          >
            {MERCH_FILTERS.map((item) => (
              <button
                key={item.slug}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());

                  if (selectedMerchFilter === item.slug) {
                    params.delete("filter");
                  } else {
                    params.set("filter", item.slug);
                  }

                  router.replace(`/products?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className={`rounded border px-3 py-1 text-xs tracking-wide ${
                  selectedMerchFilter === item.slug
                    ? "bg-black text-white"
                    : "border-neutral-300 text-black hover:bg-black hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());

                  if (selectedCategory === cat.slug) {
                    params.delete("category");
                  } else {
                    params.set("category", cat.slug);
                  }

                  router.replace(`/products?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className={`rounded border px-3 py-1 text-xs tracking-wide ${
                  selectedCategory === cat.slug
                    ? "bg-black text-white"
                    : "border-neutral-300 text-black hover:bg-black hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <button
            onClick={toggleMobileFilters}
            className="flex items-center gap-2 text-sm font-semibold text-black"
          >
            Filters
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isMobileFiltersOpen ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        <div className="mt-12">
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 shrink-0 space-y-10">
              {allSizes.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-black">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-9 w-9 border text-xs transition-colors ${
                          selectedSizes.has(size)
                            ? "bg-black text-white"
                            : "text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">
                  Availability
                </h3>
                <div className="space-y-2 text-sm text-black">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={showInStock}
                      onChange={(e) => toggleInStock(e.target.checked)}
                    />
                    In Stock{" "}
                    <span className="text-blue-600">({inStockCount})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      checked={showOutOfStock}
                      onChange={(e) => toggleOutOfStock(e.target.checked)}
                    />
                    Out of Stock{" "}
                    <span className="text-blue-600">({outOfStockCount})</span>
                  </label>
                </div>
              </div>

              {/* DEPARTMENT FILTER */}
              <div>
                <button
                  onClick={() => toggleFilter("Department")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Department
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Department") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Department") && (
                  <div className="mt-4 space-y-2 text-sm text-black">
                    {departments.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartment === d.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );

                            if (selectedDepartment === d.slug) {
                              params.delete("department");
                            } else {
                              params.set("department", d.slug);
                            }

                            router.replace(`/products?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        />
                        {d.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* FILTERS */}
              <div>
                <button
                  onClick={() => toggleFilter("Filter")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Filter
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Filter") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Filter") && (
                  <div className="mt-4 space-y-2 text-sm text-black">
                    {MERCH_FILTERS.map((item) => (
                      <label
                        key={item.slug}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMerchFilter === item.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );

                            if (selectedMerchFilter === item.slug) {
                              params.delete("filter");
                            } else {
                              params.set("filter", item.slug);
                            }

                            router.replace(`/products?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* CATEGORY FILTER */}
              <div>
                <button
                  onClick={() => toggleFilter("Category")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Category
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Category") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Category") && (
                  <div className="mt-4 space-y-2 text-sm text-black">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );

                            if (selectedCategory === cat.slug) {
                              params.delete("category");
                            } else {
                              params.set("category", cat.slug);
                            }

                            router.replace(`/products?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* COLORS FILTER */}
              {allColors.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFilter("Colors")}
                    className="flex w-full items-center justify-between text-sm font-semibold text-black"
                  >
                    Colors
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded("Colors") ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isExpanded("Colors") && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {allColors.map((color) => {
                        const parsed = parseStoredColor(color);
                        const swatch = isHexColor(parsed.value)
                          ? parsed.value
                          : undefined;
                        return (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            style={
                              swatch ? { backgroundColor: swatch } : undefined
                            }
                            aria-label={parsed.name}
                            className={`h-8 w-8 rounded border hover:scale-110 transition-transform ${
                              swatch ? "" : "bg-gray-300"
                            } ${
                              selectedColors.has(color)
                                ? "ring-2 ring-offset-2 ring-black"
                                : ""
                            }`}
                            title={parsed.name}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* PRICE RANGE FILTER */}
              <div>
                <button
                  onClick={() => toggleFilter("Price Range")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Price Range
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Price Range") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Price Range") && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="100"
                        value={maxPrice}
                        onChange={handlePriceChange}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>
                        {formatCurrencyFromCentsConverted(0, currency, fxRate)}
                      </span>
                      <span>
                        {formatCurrencyFromCentsConverted(
                          maxPrice,
                          currency,
                          fxRate,
                        )}
                      </span>
                    </div>
                    <div className="text-center text-sm text-black font-medium">
                      Range:{" "}
                      {formatCurrencyFromCentsConverted(0, currency, fxRate)} -{" "}
                      {formatCurrencyFromCentsConverted(
                        maxPrice,
                        currency,
                        fxRate,
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* COLLECTIONS FILTER */}
              {allCollections.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFilter("Collections")}
                    className="flex w-full items-center justify-between text-sm font-semibold text-black"
                  >
                    Collections
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded("Collections") ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isExpanded("Collections") && (
                    <div className="mt-4 space-y-2 text-sm text-black">
                      {allCollections.map((collection) => (
                        <label
                          key={collection.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedCollections.has(
                                `slug:${collection.slug}`,
                              ) ||
                              selectedCollections.has(`id:${collection.id}`) ||
                              selectedCollections.has(`name:${collection.name}`)
                            }
                            onChange={() => toggleCollection(collection)}
                          />
                          {collection.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAGS FILTER */}
              {allTags.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFilter("Tags")}
                    className="flex w-full items-center justify-between text-sm font-semibold text-black"
                  >
                    Tags
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isExpanded("Tags") ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {isExpanded("Tags") && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded border px-2 py-1 text-xs ${
                            selectedTags.has(tag)
                              ? "bg-black text-white"
                              : "border-neutral-300 text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </aside>

            <div className="flex-1">
              <div className="space-y-6">
                {query && (
                  <div className="sticky top-16 md:top-24 z-20 bg-neutral-200 pb-4 items-center justify-between gap-2 rounded text-white px-4 py-3 mb-6">
                    <p className="text-sm text-neutral-900">
                      Showing results for{" "}
                      <span className="font-semibold">
                        &ldquo;{query}&rdquo;
                      </span>
                      <span className="ml-2 text-neutral-900">
                        ({products.length} item
                        {products.length !== 1 ? "s" : ""} found)
                      </span>
                    </p>
                  </div>
                )}

                <Suspense fallback={<ProductsGridSkeleton />}>
                  {isPending ? (
                    <ProductsGridSkeleton />
                  ) : (
                    <>
                      <div
                        className={`
                          grid gap-8 transition-opacity duration-300
                          ${isPending ? "opacity-40" : "opacity-100"}
                          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                        `}
                      >
                        {products.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                          >
                            {/* product card */}
                            <div className="relative h-105 bg-white group">
                              <Image
                                src={product.image || "/placeholder.png"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />

                              {/* FAVORITE BUTTON */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleToggleFavorite(product.id);
                                }}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
                              >
                                <Heart
                                  className={`h-5 w-5 ${
                                    isFavorited(product.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-black"
                                  }`}
                                />
                              </button>

                              {/* ADD TO CART */}
                              <button
                                disabled={isFavoritePending}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDialogProduct(product);
                                }}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-2 text-sm text-black"
                              >
                                <ShoppingBag className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm text-black">
                              <div>
                                <p className="text-neutral-500">
                                  {product.description ?? "product"}
                                </p>
                                <p className="font-medium">{product.name}</p>
                              </div>
                              <p className="font-semibold">
                                {formatCurrencyFromCentsConverted(
                                  product.price,
                                  currency,
                                  fxRate,
                                )}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {products.length === 0 && (
                        <div className="col-span-full py-20 text-center text-neutral-500">
                          <p className="text-lg">No products found</p>
                          <p className="text-sm mt-2">
                            Try adjusting your filters
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </Suspense>
              </div>
            </div>
          </div>

          {/* Mobile filters drawer */}
          <div
            className={`fixed inset-0 z-40 md:hidden ${
              isMobileFiltersOpen ? "block" : "hidden"
            }`}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={toggleMobileFilters}
            />
            <aside className="absolute left-0 top-0 h-dvh w-72 max-w-[85vw] space-y-8 bg-white p-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-bold text-black">Filters</h2>
                <button onClick={toggleMobileFilters} className="p-1">
                  <X className="h-5 w-5 text-black" />
                </button>
              </div>

              {allSizes.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-black">
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`h-9 w-9 border text-xs transition-colors ${
                          selectedSizes.has(size)
                            ? "bg-black text-white"
                            : "text-black hover:bg-black hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">
                  Availability
                </h3>
                <div className="space-y-2 text-sm text-black">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInStock}
                      onChange={(e) => toggleInStock(e.target.checked)}
                    />
                    In Stock{" "}
                    <span className="text-blue-600">({inStockCount})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOutOfStock}
                      onChange={(e) => toggleOutOfStock(e.target.checked)}
                    />
                    Out of Stock{" "}
                    <span className="text-blue-600">({outOfStockCount})</span>
                  </label>
                </div>
              </div>

              {departments.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-black">
                    Department
                  </h3>
                  <div className="space-y-2 text-sm text-black">
                    {departments.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartment === d.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            if (selectedDepartment === d.slug) {
                              params.delete("department");
                            } else {
                              params.set("department", d.slug);
                            }
                            router.replace(`/products?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        />
                        {d.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">
                  Filter
                </h3>
                <div className="space-y-2 text-sm text-black">
                  {MERCH_FILTERS.map((item) => (
                    <label
                      key={item.slug}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMerchFilter === item.slug}
                        onChange={() => {
                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          if (selectedMerchFilter === item.slug) {
                            params.delete("filter");
                          } else {
                            params.set("filter", item.slug);
                          }
                          router.replace(`/products?${params.toString()}`, {
                            scroll: false,
                          });
                        }}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              {categories.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-black">
                    Category
                  </h3>
                  <div className="space-y-2 text-sm text-black">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategory === cat.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );
                            if (selectedCategory === cat.slug) {
                              params.delete("category");
                            } else {
                              params.set("category", cat.slug);
                            }
                            router.replace(`/products?${params.toString()}`, {
                              scroll: false,
                            });
                          }}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {allColors.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-black">
                    Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color) => {
                      const parsed = parseStoredColor(color);
                      const swatch = isHexColor(parsed.value)
                        ? parsed.value
                        : undefined;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleColor(color)}
                          style={
                            swatch ? { backgroundColor: swatch } : undefined
                          }
                          aria-label={parsed.name}
                          className={`h-8 w-8 rounded border hover:scale-110 transition-transform ${
                            swatch ? "" : "bg-gray-300"
                          } ${
                            selectedColors.has(color)
                              ? "ring-2 ring-offset-2 ring-black"
                              : ""
                          }`}
                          title={parsed.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* ADD TO CART DIALOG */}
      {dialogProduct && (
        <AddToCartDialog
          product={dialogProduct}
          isOpen={!!dialogProduct}
          onClose={() => setDialogProduct(null)}
        />
      )}
    </section>
  );
}
