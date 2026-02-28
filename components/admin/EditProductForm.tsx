"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateProductAdmin } from "@/app/actions/admin.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/admin/ImageUpload";
import ColorPicker from "@/components/admin/ColorPicker";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string | null;
  sizes: string[];
  colors: string[];
  tags: string[];
  collection: string | null;
  active: boolean;
  isFeatured: boolean;
  inventory: {
    quantity: number;
  } | null;
};

interface EditProductFormProps {
  product: Product;
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    price: (product.price / 100).toFixed(2),
    stock: product.inventory?.quantity.toString() || "0",
    description: product.description || "",
    image: product.image || "",
    categoryId: product.categoryId || "",
    sizes: product.sizes.join(", "),
    colors: product.colors,
    tags: product.tags.join(", "),
    collection: product.collection || "",
    active: product.active,
    isFeatured: product.isFeatured,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleColorsChange = (colors: string[]) => {
    setFormData((prev) => ({
      ...prev,
      colors: colors,
    }));
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
        const result = await updateProductAdmin(product.slug, {
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
          colors: formData.colors,
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
          toast.success("Product updated successfully!");
          router.push("/admin/products");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update product",
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/products"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Edit Product
          </h1>
          <p className="text-sm text-slate-600 md:text-base">
            Update product details and manage inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Product identity, pricing, and stock details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="product-slug"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content & Media</CardTitle>
              <CardDescription>
                Update description and image source.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={4}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                />
              </div>

              <ImageUpload
                value={formData.image}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, image: url }))
                }
                disabled={isPending}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attributes</CardTitle>
              <CardDescription>
                Manage variants and taxonomy with comma-separated values.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes</Label>
                  <Input
                    id="sizes"
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                    placeholder="XS, S, M, L, XL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colors">Colors</Label>
                  <ColorPicker
                    id="colors"
                    selectedColors={formData.colors}
                    onChange={handleColorsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="summer, casual"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Collection</Label>
                <Input
                  id="collection"
                  type="text"
                  name="collection"
                  value={formData.collection}
                  onChange={handleChange}
                  placeholder="Spring 2026"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Control storefront visibility and featuring.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="size-4 rounded border-slate-300"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="size-4 rounded border-slate-300"
                />
                Featured
              </label>
            </CardContent>
          </Card>

          <div className="sticky bottom-4 z-10 rounded-xl border bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
