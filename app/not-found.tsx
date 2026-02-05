"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  // Read reason injected from server (optional, safe fallback)
  const reason =
    typeof document !== "undefined"
      ? document
          .querySelector('meta[name="x-not-found-reason"]')
          ?.getAttribute("content")
      : null;

  const type = reason ?? "missing";

  const messages: Record<
    string,
    { title: string; description: string }
  > = {
    auth: {
      title: "Access denied",
      description: "You must be logged in to access this page.",
    },
    admin: {
      title: "Restricted area",
      description: "You don’t have permission to view this section.",
    },
    product: {
      title: "Product not found",
      description: "This product may no longer be available.",
    },
    missing: {
      title: "Page not found",
      description: "The page you’re looking for doesn’t exist.",
    },
  };

  const { title, description } =
    messages[type] ?? messages.missing;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-md text-center bg-white border p-10"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black mb-4"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-neutral-600 mb-8"
        >
          {description}
        </motion.p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-black text-white text-sm"
          >
            Go back
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border text-sm"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
