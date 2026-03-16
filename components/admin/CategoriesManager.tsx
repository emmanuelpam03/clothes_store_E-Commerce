"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createCategoryAdmin,
  deleteCategoryAdmin,
} from "@/app/actions/categories.actions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  initialCategories: Category[];
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const existingSlugs = useMemo(
    () => new Set(categories.map((c) => c.slug.toLowerCase())),
    [categories],
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">New category</h2>
        <p className="text-sm text-slate-600 mt-1">
          Categories are used when creating products and for storefront
          navigation.
        </p>

        <form
          className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isSaving) return;

            const trimmedName = name.trim();
            const finalSlug = slugify(slug || trimmedName);

            if (!trimmedName) {
              toast.error("Name is required");
              return;
            }

            if (!finalSlug) {
              toast.error("Slug is required");
              return;
            }

            if (existingSlugs.has(finalSlug)) {
              toast.error("A category with this slug already exists");
              return;
            }

            setIsSaving(true);
            try {
              const result = await createCategoryAdmin({
                name: trimmedName,
                slug: finalSlug,
              });

              if (result.success) {
                setCategories((prev) => [...prev, result.category]);
                setName("");
                setSlug("");
                toast.success("Category created");
              }
            } catch (err) {
              toast.error(
                err instanceof Error
                  ? err.message
                  : "Failed to create category",
              );
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="catName"
            >
              Name
            </label>
            <input
              id="catName"
              value={name}
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                if (!slug.trim()) setSlug(slugify(next));
              }}
              placeholder="e.g. Men"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="catSlug"
            >
              Slug
            </label>
            <input
              id="catSlug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. men"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={isSaving}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSaving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Categories</h2>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-600 mt-3">No categories yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2 pr-4 text-slate-700">{c.slug}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          disabled={deletingId === c.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          onClick={async () => {
                            setDeletingId(c.id);
                            try {
                              await deleteCategoryAdmin(c.id);
                              setCategories((prev) =>
                                prev.filter((x) => x.id !== c.id),
                              );
                              toast.success("Category deleted");
                            } catch (err) {
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to delete category",
                              );
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          {deletingId === c.id ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
