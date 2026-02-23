"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProductAdmin } from "@/app/actions/admin.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    stock: "",
    description: "",
    image: "",
    categoryId: "",
    sizes: "",
    colors: "",
    tags: "",
    collection: "",
    active: true,
    isFeatured: false,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Auto-generate slug from name
      if (name === "name" && !formData.slug) {
        const autoSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormData((prev) => ({
          ...prev,
          name: value,
          slug: autoSlug,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.slug ||
      !formData.price ||
      !formData.stock
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    const stock = parseInt(formData.stock);

    if (isNaN(priceInCents) || priceInCents <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createProductAdmin({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          price: priceInCents,
          image: formData.image || undefined,
          categoryId: formData.categoryId || undefined,
          sizes: formData.sizes
            ? formData.sizes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          colors: formData.colors
            ? formData.colors
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
            : [],
          tags: formData.tags
            ? formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          collection: formData.collection || undefined,
          stock,
          active: formData.active,
          isFeatured: formData.isFeatured,
        });

        if (result.success) {
          toast.success("Product created successfully!");
          router.push("/admin/products");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create product",
        );
      }
    });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-slate-600 mt-1">
            Create a new product and add it to your catalog.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-8 space-y-6"
        >
          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="product-slug"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sizes, Colors, Tags */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sizes (comma-separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="XS, S, M, L, XL"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Colors (comma-separated)
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="Black, White, Blue"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="summer, casual"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Collection
            </label>
            <input
              type="text"
              name="collection"
              value={formData.collection}
              onChange={handleChange}
              placeholder="Spring 2026"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700">
                Active
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700">
                Featured
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {isPending ? "Creating..." : "Create Product"}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
