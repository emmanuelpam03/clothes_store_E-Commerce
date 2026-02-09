export function NewThisWeekSkeleton({ visible = 4 }: { visible?: number }) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: visible }).map((_, i) => (
        <div
          key={i}
          className="shrink-0"
          style={{ width: `${100 / visible}%` }}
        >
          <div
            className="h-72 bg-neutral-200 animate-shimmer"
            style={{ animationDelay: `${i * 120}ms` }}
          />
          <div className="mt-3 space-y-2">
            <div
              className="h-4 w-3/4 bg-neutral-300 animate-shimmer"
              style={{ animationDelay: `${i * 120 + 80}ms` }}
            />
            <div
              className="h-4 w-1/3 bg-neutral-300 animate-shimmer"
              style={{ animationDelay: `${i * 120 + 160}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
