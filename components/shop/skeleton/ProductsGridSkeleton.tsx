export default function ProductsGridSkeleton({
  count = 9,
}: {
  count?: number;
}) {
  return (
    <div className="flex-1 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          {/* IMAGE PLACEHOLDER */}
          <div className="relative h-105 bg-neutral-300" />

          {/* META */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-neutral-300 rounded" />
              <div className="h-4 w-36 bg-neutral-300 rounded" />
            </div>

            <div className="h-4 w-10 bg-neutral-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
