"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createDepartmentAdmin,
  deleteDepartmentAdmin,
  updateDepartmentAdmin,
} from "@/app/actions/departments.actions";
import { slugify } from "@/lib/slug";

type Department = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type Props = {
  initialDepartments: Department[];
};

export default function DepartmentsManager({ initialDepartments }: Props) {
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const existingSlugs = useMemo(
    () => new Set(departments.map((d) => d.slug.toLowerCase())),
    [departments],
  );

  const openEditModal = (department: Department) => {
    setEditing(department);
    setEditName(department.name);
    setEditSlug(department.slug);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">New department</h2>
        <p className="text-sm text-slate-600 mt-1">
          Departments are used for Men/Women/Kids-style storefront navigation.
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
              toast.error("A department with this slug already exists");
              return;
            }

            setIsSaving(true);
            try {
              const result = await createDepartmentAdmin({
                name: trimmedName,
                slug: finalSlug,
              });

              if (result.success) {
                setDepartments((prev) => [...prev, result.department]);
                setName("");
                setSlug("");
                toast.success("Department created");
              } else {
                toast.error(result.error);
              }
            } catch (err) {
              toast.error(
                err instanceof Error
                  ? err.message
                  : "Failed to create department",
              );
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="depName"
            >
              Name
            </label>
            <input
              id="depName"
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
              htmlFor="depSlug"
            >
              Slug
            </label>
            <input
              id="depSlug"
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
        <h2 className="text-lg font-semibold text-slate-900">Departments</h2>

        {departments.length === 0 ? (
          <p className="text-sm text-slate-600 mt-3">No departments yet.</p>
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
                {departments
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        {d.name}
                      </td>
                      <td className="py-2 pr-4 text-slate-700">{d.slug}</td>
                      <td className="py-2 pr-4 text-slate-700">
                        {d.productCount}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-slate-700 hover:text-slate-900"
                            onClick={() => openEditModal(d)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === d.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            onClick={() => setConfirmDelete(d)}
                          >
                            {deletingId === d.id ? "Deleting..." : "Delete"}
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
            aria-labelledby="department-delete-title"
            className="w-full max-w-sm rounded-xl bg-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="department-delete-title"
              className="text-base font-semibold text-slate-900"
            >
              Delete department?
            </h3>
            <p className="text-sm text-slate-600">
              Department &quot;{confirmDelete.name}&quot; currently has{" "}
              {confirmDelete.productCount} product
              {confirmDelete.productCount === 1 ? "" : "s"}.
            </p>
            {confirmDelete.productCount > 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                This department cannot be deleted until all products are moved
                out of it.
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
                    const result = await deleteDepartmentAdmin(
                      confirmDelete.id,
                    );
                    if (!result.success) {
                      toast.error(result.error);
                      if (typeof result.productCount === "number") {
                        setDepartments((prev) =>
                          prev.map((x) =>
                            x.id === confirmDelete.id
                              ? { ...x, productCount: result.productCount }
                              : x,
                          ),
                        );
                      }
                      return;
                    }
                    setDepartments((prev) =>
                      prev.filter((x) => x.id !== confirmDelete.id),
                    );
                    toast.success("Department deleted");
                    setConfirmDelete(null);
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Failed to delete department",
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
            aria-labelledby="department-edit-title"
            className="w-full max-w-md rounded-xl bg-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="department-edit-title"
              className="text-base font-semibold text-slate-900"
            >
              Edit department
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

                const duplicate = departments.find(
                  (d) =>
                    d.id !== editing.id &&
                    d.slug.toLowerCase() === finalSlug.toLowerCase(),
                );
                if (duplicate) {
                  toast.error("A department with this slug already exists");
                  return;
                }

                setIsUpdating(true);
                try {
                  const result = await updateDepartmentAdmin({
                    id: editing.id,
                    name: trimmedName,
                    slug: finalSlug,
                  });

                  if (!result.success) {
                    toast.error(result.error);
                    return;
                  }

                  setDepartments((prev) =>
                    prev.map((d) =>
                      d.id === editing.id ? result.department : d,
                    ),
                  );
                  toast.success("Department updated");
                  setEditing(null);
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to update department",
                  );
                } finally {
                  setIsUpdating(false);
                }
              }}
            >
              <div className="space-y-1">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="editDepName"
                >
                  Name
                </label>
                <input
                  id="editDepName"
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
                  htmlFor="editDepSlug"
                >
                  Slug
                </label>
                <input
                  id="editDepSlug"
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
