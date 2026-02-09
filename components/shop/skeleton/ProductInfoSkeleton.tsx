export default function ProductInfoSkeleton() {
  return (
    <div className="min-h-screen bg-[#f3f3f3] px-4 md:px-10 lg:flex lg:items-center lg:justify-center">
      <div className="w-full mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[420px_70px_380px] items-center">
          {/* IMAGE */}
          <div className="flex gap-6 lg:col-span-2">
            <div className="relative bg-white border w-full md:w-[420px] aspect-4/5 animate-pulse" />

            <div className="flex md:flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-14 border bg-neutral-200 animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className="border bg-[#f3f3f3] px-6 py-8 space-y-4">
            <div className="h-4 w-2/3 bg-neutral-300 animate-pulse" />
            <div className="h-4 w-20 bg-neutral-300 animate-pulse" />
            <div className="h-12 w-full bg-neutral-200 animate-pulse" />

            <div className="space-y-2 mt-6">
              <div className="h-3 w-20 bg-neutral-300 animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 bg-neutral-300 animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="h-10 w-full bg-neutral-300 animate-pulse mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
