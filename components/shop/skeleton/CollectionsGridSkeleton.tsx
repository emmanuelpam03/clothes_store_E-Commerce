export function CollectionsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full">
          {/* IMAGE SHIMMER */}
          <div
            className="h-80 md:h-[520px] rounded bg-linear-to-r
              from-neutral-200 via-neutral-300 to-neutral-200
              animate-shimmer"
            style={{
              animationDelay: `${i * 120}ms`,
            }}
          />

          {/* TEXT */}
          <div className="mt-4 flex justify-between">
            <div
              className="h-4 w-2/3 rounded bg-neutral-300 animate-shimmer"
              style={{ animationDelay: `${i * 120 + 80}ms` }}
            />
            <div
              className="h-4 w-1/4 rounded bg-neutral-300 animate-shimmer"
              style={{ animationDelay: `${i * 120 + 160}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
