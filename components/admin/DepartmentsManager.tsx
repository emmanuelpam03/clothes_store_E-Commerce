"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createDepartmentAdmin,
  deleteDepartmentAdmin,
} from "@/app/actions/departments.actions";
import { slugify } from "@/lib/slug";

type Department = {
  id: string;
  name: string;
  slug: string;
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

  const existingSlugs = useMemo(
    () => new Set(departments.map((d) => d.slug.toLowerCase())),
    [departments],
  );

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
                      <td className="py-2">
                        <button
                          type="button"
                          disabled={deletingId === d.id}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          onClick={() => setConfirmDelete(d)}
                        >
                          {deletingId === d.id ? "Deleting..." : "Delete"}
                        </button>
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
                  This will permanently delete &quot;{confirmDelete.name}&quot;.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={!!deletingId}
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-lg border py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === confirmDelete.id}
                onClick={async () => {
                  setDeletingId(confirmDelete.id);
                  try {
                    await deleteDepartmentAdmin(confirmDelete.id);
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
    </div>
  );
}
