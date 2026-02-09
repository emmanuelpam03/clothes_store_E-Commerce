"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Heart, ChevronDown, ChevronRight, X } from "lucide-react";
import { Suspense, useState } from "react";
import { addToCartAction } from "@/app/actions/cart.actions";
import { useCart } from "@/lib/cart/cart";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites/useFavorites";
import ProductsGridSkeleton from "./skeleton/ProductsGridSkeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
};

const CATEGORIES = [
  "NEW",
  "BEST SELLERS",
  "SHIRTS",
  "T-SHIRTS",
  "POLO SHIRTS",
  "JEANS",
  "JACKETS",
  "SHORTS",
];

export default function ProductsPageComponent({
  products,
  query,
}: {
  products: Product[];
  query: string | undefined;
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
          router.replace("/products", { scroll: false });
        } else {
          router.replace(`/products?q=${encodeURIComponent(inputValue)}`, {
            scroll: false,
          });
        }
      });
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [inputValue, router]);

  const { addItem } = useCart();
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";
  const {
    isFavorited,
    toggleFavorite,
    isLoading: isFavoritePending,
  } = useFavorites();

  const handleAddToCart = async (product: Product) => {
    const cartItem = {
      id: product.id,
      title: product.name,
      subtitle: product.description ?? "",
      price: product.price / 100,
      image: product.image ?? "/placeholder.png",
      size: "L",
      color: "#000000",
      qty: 1,
    };
    addItem(cartItem);
    try {
      if (isLoggedIn) {
        await addToCartAction(product.id);
      }
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  // Add state for price range
  const [maxPrice, setMaxPrice] = useState(500);

  // Add state for mobile filters toggle
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleToggleFavorite = async (productId: string) => {
    try {
      const result = await toggleFavorite(productId);
      toast.success(
        result.isFavorited ? "Added to favorites" : "Removed from favorites",
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to update favorite");
    }
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
    setMaxPrice(Number(e.target.value));
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

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
                    router.replace("/products", { scroll: false });
                  }
                }}
                placeholder="Search"
                className="w-full bg-transparent outline-none placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* CATEGORY PILLS - Hidden on mobile when filters are open */}
          <div
            className={`flex flex-wrap gap-2 ${
              isMobileFiltersOpen ? "hidden" : "hidden md:flex"
            }`}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="rounded border border-neutral-300 px-3 py-1 text-xs tracking-wide text-black hover:bg-black hover:text-white"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SUGGESTIONs */}
        {showSuggestions && inputValue && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-auto rounded bg-white shadow border">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setInputValue(s.name);
                  setShowSuggestions(false);
                  router.replace(`/products?q=${encodeURIComponent(s.name)}`, {
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
              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "2X"].map((size) => (
                    <button
                      key={size}
                      className="h-9 w-9 border text-xs text-black hover:bg-black hover:text-white"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">
                  Availability
                </h3>
                <div className="space-y-2 text-sm text-black">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Availability <span className="text-blue-600">(450)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Out of Stock <span className="text-blue-600">(18)</span>
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
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2">
                        <input type="checkbox" />
                        {cat}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* COLORS FILTER */}
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
                    {[
                      { name: "Black", color: "bg-black" },
                      { name: "White", color: "bg-white border" },
                      { name: "Gray", color: "bg-gray-500" },
                      { name: "Blue", color: "bg-blue-500" },
                      { name: "Red", color: "bg-red-500" },
                      { name: "Green", color: "bg-green-500" },
                    ].map((color) => (
                      <button
                        key={color.name}
                        className={`h-8 w-8 rounded ${color.color} border hover:scale-110 transition-transform`}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>

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
                        max="1000"
                        value={maxPrice}
                        onChange={handlePriceChange}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>$0</span>
                      <span>${maxPrice}</span>
                    </div>
                    <div className="text-center text-sm text-black font-medium">
                      Range: $0 - ${maxPrice}
                    </div>
                  </div>
                )}
              </div>

              {/* COLLECTIONS FILTER */}
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
                    {[
                      "Spring 2024",
                      "Summer 2024",
                      "Fall 2024",
                      "Winter 2024",
                    ].map((collection) => (
                      <label
                        key={collection}
                        className="flex items-center gap-2"
                      >
                        <input type="checkbox" />
                        {collection}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* TAGS FILTER */}
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
                    {["Casual", "Formal", "Sport", "Vintage", "Modern"].map(
                      (tag) => (
                        <button
                          key={tag}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs text-black hover:bg-black hover:text-white"
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* RATINGS FILTER */}
              <div>
                <button
                  onClick={() => toggleFilter("Ratings")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Ratings
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Ratings") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Ratings") && (
                  <div className="mt-4 space-y-2 text-sm text-black">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2">
                        <input type="checkbox" />
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-yellow-400 ${
                                i < rating ? "fill-current" : ""
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500">
                          ({(6 - rating) * 15})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* MOBILE FILTER SIDEBAR - Slides in and pushes content */}
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

              {/* SIZE */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "2X"].map((size) => (
                    <button
                      key={size}
                      className="h-9 w-9 border text-xs text-black hover:bg-black hover:text-white"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-black">
                  Availability
                </h3>
                <div className="space-y-2 text-sm text-black">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Availability <span className="text-blue-600">(450)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" />
                    Out of Stock <span className="text-blue-600">(18)</span>
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
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2">
                        <input type="checkbox" />
                        {cat}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* COLORS FILTER */}
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
                    {[
                      { name: "Black", color: "bg-black" },
                      { name: "White", color: "bg-white border" },
                      { name: "Gray", color: "bg-gray-500" },
                      { name: "Blue", color: "bg-blue-500" },
                      { name: "Red", color: "bg-red-500" },
                      { name: "Green", color: "bg-green-500" },
                    ].map((color) => (
                      <button
                        key={color.name}
                        className={`h-8 w-8 rounded ${color.color} border hover:scale-110 transition-transform`}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>

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
                        max="1000"
                        value={maxPrice}
                        onChange={handlePriceChange}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>$0</span>
                      <span>${maxPrice}</span>
                    </div>
                    <div className="text-center text-sm text-black font-medium">
                      Range: $0 - ${maxPrice}
                    </div>
                  </div>
                )}
              </div>

              {/* COLLECTIONS FILTER */}
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
                    {[
                      "Spring 2024",
                      "Summer 2024",
                      "Fall 2024",
                      "Winter 2024",
                    ].map((collection) => (
                      <label
                        key={collection}
                        className="flex items-center gap-2"
                      >
                        <input type="checkbox" />
                        {collection}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* TAGS FILTER */}
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
                    {["Casual", "Formal", "Sport", "Vintage", "Modern"].map(
                      (tag) => (
                        <button
                          key={tag}
                          className="rounded border border-neutral-300 px-2 py-1 text-xs text-black hover:bg-black hover:text-white"
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* RATINGS FILTER */}
              <div>
                <button
                  onClick={() => toggleFilter("Ratings")}
                  className="flex w-full items-center justify-between text-sm font-semibold text-black"
                >
                  Ratings
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded("Ratings") ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded("Ratings") && (
                  <div className="mt-4 space-y-2 text-sm text-black">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center gap-2">
                        <input type="checkbox" />
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-yellow-400 ${
                                i < rating ? "fill-current" : ""
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500">
                          ({(6 - rating) * 15})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* PRODUCTS GRID - Adjusts columns based on available space */}
            <div className="flex-1 flex flex-col">
              <Suspense fallback={<ProductsGridSkeleton count={6} />}>
                {/* NO RESULTS */}
                {query && products.length === 0 ? (
                  <div className="flex flex-1 justify-center min-h-100px">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-black">
                        No results found
                      </p>
                      <p className="mt-2 text-sm text-neutral-500">
                        We couldn’t find anything for{" "}
                        <span className="font-medium">“{query}”</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* SEARCH INFO — NOW ALWAYS ON TOP */}
                    {/* STICKY SEARCH HEADER */}
                    {query && (
                      <div className="sticky top-16 md:top-24 z-20 bg-neutral-200 pb-4 items-center justify-between gap-2 rounded text-white px-4 py-3 mb-6">
                        <p className="text-sm text-neutral-900">
                          Showing results for{" "}
                          <span className="font-semibold">“{query}”</span>
                          <span className="ml-2 text-neutral-900">
                            ({products.length} item
                            {products.length !== 1 ? "s" : ""} found)
                          </span>
                        </p>
                      </div>
                    )}

                    {/* GRID */}
                    <div
                      className={`
                      grid gap-8 transition-opacity duration-300
                      ${isPending ? "opacity-40" : "opacity-100"}
                      ${isMobileFiltersOpen ? "hidden md:grid" : "grid"}
                      grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                    `}
                    >
                      {products.map((product, i) => (
                        <Link key={i} href={`/products/${product.slug}`}>
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

                            {/* ADD */}
                            <button
                              disabled={isFavoritePending}
                              onClick={(e) => {
                                e.preventDefault();
                                void handleAddToCart(product);
                              }}
                              className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-2 text-sm text-black"
                            >
                              +
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-sm text-black">
                            <div>
                              <p className="text-neutral-500">
                                {product.description ?? "product"}
                              </p>
                              <p className="font-medium">{product.name}</p>
                            </div>
                            <p className="font-semibold">{product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
