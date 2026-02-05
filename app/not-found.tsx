"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-6">
      <div className="max-w-md text-center bg-white border p-10">
        <h1 className="text-3xl font-black mb-4">Page not found</h1>

        <p className="text-sm text-neutral-600 mb-8">
          The page you’re trying to access doesn’t exist or you don’t have
          permission to view it.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-black text-white text-sm cursor-pointer"
          >
            Go back
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border text-sm cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
