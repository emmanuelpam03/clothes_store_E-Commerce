"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createCategoryAdmin,
  deleteCategoryAdmin,
  updateCategoryAdmin,
} from "@/app/actions/categories.actions";
import { slugify } from "@/lib/slug";

type Category = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type Props = {
  initialCategories: Category[];
};

export default function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const existingSlugs = useMemo(
    () => new Set(categories.map((c) => c.slug.toLowerCase())),
    [categories],
  );

  const openEditModal = (category: Category) => {
    setEditing(category);
    setEditName(category.name);
    setEditSlug(category.slug);
  };

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
            const finalSlug = slugify(slug || trimmedName, { maxLength: 80 });

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
              } else {
                toast.error(result.error);
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
                if (!slug.trim()) setSlug(slugify(next, { maxLength: 80 }));
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
                  <th className="py-2 pr-4">Products</th>
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
                      <td className="py-2 pr-4 text-slate-700">
                        {c.productCount}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-slate-700 hover:text-slate-900"
                            onClick={() => openEditModal(c)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === c.id}
                            onClick={async () => {
                              setConfirmDelete(c);
                            }}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            {deletingId === c.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => {
            if (!deletingId) setConfirmDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-delete-title"
            className="w-full max-w-sm rounded-xl bg-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="category-delete-title"
              className="text-base font-semibold text-slate-900"
            >
              Delete category?
            </h3>
            <p className="text-sm text-slate-600">
              Category &quot;{confirmDelete.name}&quot; currently has{" "}
              {confirmDelete.productCount} product
              {confirmDelete.productCount === 1 ? "" : "s"}.
            </p>
            {confirmDelete.productCount > 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                This category cannot be deleted until all products are moved out
                of it.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                This action is permanent.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={!!deletingId}
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={
                  deletingId === confirmDelete.id ||
                  confirmDelete.productCount > 0
                }
                onClick={async () => {
                  setDeletingId(confirmDelete.id);
                  try {
                    const result = await deleteCategoryAdmin(confirmDelete.id);
                    if (!result.success) {
                      toast.error(result.error);
                      if (typeof result.productCount === "number") {
                        setCategories((prev) =>
                          prev.map((x) =>
                            x.id === confirmDelete.id
                              ? { ...x, productCount: result.productCount }
                              : x,
                          ),
                        );
                      }
                      return;
                    }

                    setCategories((prev) =>
                      prev.filter((x) => x.id !== confirmDelete.id),
                    );
                    toast.success("Category deleted");
                    setConfirmDelete(null);
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
                className="flex-1 rounded-lg bg-slate-900 py-2 text-sm text-white disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => {
            if (!isUpdating) setEditing(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-edit-title"
            className="w-full max-w-md rounded-xl bg-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="category-edit-title"
              className="text-base font-semibold text-slate-900"
            >
              Edit category
            </h3>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editing || isUpdating) return;

                const trimmedName = editName.trim();
                const finalSlug = slugify(editSlug || trimmedName, {
                  maxLength: 80,
                });

                if (!trimmedName) {
                  toast.error("Name is required");
                  return;
                }

                if (!finalSlug) {
                  toast.error("Slug is required");
                  return;
                }

                const duplicate = categories.find(
                  (c) =>
                    c.id !== editing.id &&
                    c.slug.toLowerCase() === finalSlug.toLowerCase(),
                );
                if (duplicate) {
                  toast.error("A category with this slug already exists");
                  return;
                }

                setIsUpdating(true);
                try {
                  const result = await updateCategoryAdmin({
                    id: editing.id,
                    name: trimmedName,
                    slug: finalSlug,
                  });

                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }

                  setCategories((prev) =>
                    prev.map((c) =>
                      c.id === editing.id ? result.category : c,
                    ),
                  );
                  toast.success("Category updated");
                  setEditing(null);
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to update category",
                  );
                } finally {
                  setIsUpdating(false);
                }
              }}
            >
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="editCatName"
                >
                  Name
                </label>
                <input
                  id="editCatName"
                  value={editName}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEditName(next);
                    if (!editSlug.trim()) {
                      setEditSlug(slugify(next, { maxLength: 80 }));
                    }
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="editCatSlug"
                >
                  Slug
                </label>
                <input
                  id="editCatSlug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  disabled={isUpdating}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-lg bg-slate-900 py-2 text-sm text-white disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
