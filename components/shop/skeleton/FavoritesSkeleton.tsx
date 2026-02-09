export default function FavoritesSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-12">
          <div className="h-10 w-64 bg-neutral-300 animate-pulse mb-4" />
          <div className="h-4 w-32 bg-neutral-200 animate-pulse" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-96 bg-neutral-200 animate-pulse" />

              {/* CONTENT */}
              <div className="p-6 space-y-4">
                <div className="h-5 w-3/4 bg-neutral-300 animate-pulse" />
                <div className="h-4 w-full bg-neutral-200 animate-pulse" />
                <div className="h-6 w-24 bg-neutral-300 animate-pulse" />

                <div className="flex gap-3 mt-6">
                  <div className="h-10 flex-1 bg-neutral-300 animate-pulse" />
                  <div className="h-10 w-12 bg-neutral-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
