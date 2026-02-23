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
  collection?: string | null;
  inventory?: {
    quantity: number;
  } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const FILTERS = [
  { label: "FEATURED", slug: "featured" },
  { label: "NEW", slug: "new" },
  { label: "BEST SELLERS", slug: "best-sellers" },
];

export default function ProductsPageComponent({
  products,
  query,
  filter,
  categories,
}: {
  products: Product[];
  query: string | undefined;
  filter: string | undefined;
  categories: Category[];
}) {
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(
    new Set(["Category", "Price Range"]),
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  // suggestions
  const suggestions = products
    .slice(0, 5)
    .map((p) => ({ id: p.id, name: p.name }));

  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        if (!inputValue.trim()) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("q");
          router.replace(`/products?${params.toString()}`, { scroll: false });
        } else {
          const params = new URLSearchParams(searchParams.toString());
          params.set("q", inputValue);
          router.replace(`/products?${params.toString()}`, {
            scroll: false,
          });
        }
      });
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [inputValue, router]);

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
  const selectedCollections = new Set(
    searchParams.get("collections")?.split(",").filter(Boolean) || [],
  );
  const maxPrice = Number(searchParams.get("maxPrice") || "100000"); // Store in cents
  const showInStock = searchParams.get("inStock") === "true";
  const showOutOfStock = searchParams.get("outOfStock") === "true";

  const handleToggleFavorite = async (productId: string) => {
    try {
      await toggleFavorite(productId);
      toast.success(
        isFavorited(productId)
          ? "Removed from favorites"
          : "Added to favorites",
      );
    } catch (error) {
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

  const toggleCollection = (collection: string) => {
    const next = new Set(selectedCollections);
    if (next.has(collection)) {
      next.delete(collection);
    } else {
      next.add(collection);
    }
    updateFilters({
      collections: next.size > 0 ? Array.from(next).join(",") : undefined,
    });
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
  const allColors = Array.from(
    new Set(products.flatMap((p) => p.colors || [])),
  );
  const allTags = Array.from(new Set(products.flatMap((p) => p.tags || [])));
  const allCollections = Array.from(
    new Set(products.map((p) => p.collection).filter(Boolean) as string[]),
  );

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
        {/* BREADCRUMB */}
        <p className="text-xs text-neutral-500">Home / Products</p>

        {/* TITLE */}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-black">
          PRODUCTS
        </h1>

        {/* SEARCH + CATEGORIES */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* SEARCH */}
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

            {/* SUGGESTIONS */}
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

          {/* CATEGORY PILLS - Hidden on mobile when filters are open */}
          <div
            className={`flex flex-wrap gap-2 ${
              isMobileFiltersOpen ? "hidden" : "hidden md:flex"
            }`}
          >
            {/* NEW & BEST SELLERS */}
            {FILTERS.map((item) => (
              <button
                key={item.slug}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());

                  if (filter === item.slug) {
                    params.delete("filter");
                  } else {
                    params.set("filter", item.slug);
                  }

                  router.replace(`/products?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className={`rounded border px-3 py-1 text-xs tracking-wide ${
                  filter === item.slug
                    ? "bg-black text-white"
                    : "border-neutral-300 text-black hover:bg-black hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* DATABASE CATEGORIES */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());

                  if (filter === cat.slug) {
                    params.delete("filter");
                  } else {
                    params.set("filter", cat.slug);
                  }

                  router.replace(`/products?${params.toString()}`, {
                    scroll: false,
                  });
                }}
                className={`rounded border px-3 py-1 text-xs tracking-wide ${
                  filter === cat.slug
                    ? "bg-black text-white"
                    : "border-neutral-300 text-black hover:bg-black hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* MOBILE FILTERS TOGGLE BUTTON */}
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

        {/* MAIN GRID */}
        <div className="mt-12">
          <div className="flex gap-6">
            {/* FILTER SIDEBAR - Desktop always visible */}
            <aside className="hidden md:block w-64 shrink-0 space-y-10">
              {/* SIZE */}
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

              {/* AVAILABILITY */}
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
                    {FILTERS.map((item) => (
                      <label
                        key={item.slug}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filter === item.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );

                            if (filter === item.slug) {
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
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filter === cat.slug}
                          onChange={() => {
                            const params = new URLSearchParams(
                              searchParams.toString(),
                            );

                            if (filter === cat.slug) {
                              params.delete("filter");
                            } else {
                              params.set("filter", cat.slug);
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
                        const colorClasses: Record<string, string> = {
                          Black: "bg-black",
                          White: "bg-white border",
                          Gray: "bg-gray-500",
                          Grey: "bg-gray-500",
                          Blue: "bg-blue-500",
                          Red: "bg-red-500",
                          Green: "bg-green-500",
                          Yellow: "bg-yellow-500",
                          Orange: "bg-orange-500",
                          Purple: "bg-purple-500",
                          Pink: "bg-pink-500",
                          Brown: "bg-brown-500",
                        };
                        return (
                          <button
                            key={color}
                            onClick={() => toggleColor(color)}
                            className={`h-8 w-8 rounded ${colorClasses[color] || "bg-gray-300"} border hover:scale-110 transition-transform ${
                              selectedColors.has(color)
                                ? "ring-2 ring-offset-2 ring-black"
                                : ""
                            }`}
                            title={color}
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
                      <span>$0</span>
                      <span>${(maxPrice / 100).toFixed(2)}</span>
                    </div>
                    <div className="text-center text-sm text-black font-medium">
                      Range: $0 - ${(maxPrice / 100).toFixed(2)}
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
                          key={collection}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollections.has(collection)}
                            onChange={() => toggleCollection(collection)}
                          />
                          {collection}
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

            {/* MOBILE FILTER SIDEBAR - Simplified version */}
            <aside
              className={`
                md:hidden w-64 shrink-0 space-y-8 bg-white p-4 overflow-y-auto
                transition-all duration-300 ease-in-out
                ${
                  isMobileFiltersOpen
                    ? "max-w-64 opacity-100"
                    : "max-w-0 opacity-0 overflow-hidden p-0"
                }
              `}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-bold text-black">Filters</h2>
                <button onClick={toggleMobileFilters} className="p-1">
                  <X className="h-5 w-5 text-black" />
                </button>
              </div>

              {/* Mobile filters - Same content as desktop but in mobile view */}
              {/* SIZE */}
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

              {/* AVAILABILITY */}
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

              {/* Add other mobile filters as needed */}
            </aside>

            {/* PRODUCTS GRID */}
            <div className="flex-1">
              <div className="space-y-6">
                {query && (
                  <div className="sticky top-16 md:top-24 z-20 bg-neutral-200 pb-4 items-center justify-between gap-2 rounded text-white px-4 py-3 mb-6">
                    <p className="text-sm text-neutral-900">
                      Showing results for{" "}
                      <span className="font-semibold">"{query}"</span>
                      <span className="ml-2 text-neutral-900">
                        ({products.length} item
                        {products.length !== 1 ? "s" : ""} found)
                      </span>
                    </p>
                  </div>
                )}

                {/* GRID */}
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
                                ${(product.price / 100).toFixed(2)}
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
