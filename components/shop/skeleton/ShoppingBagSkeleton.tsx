export default function ShoppingBagSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="h-4 w-24 bg-neutral-300 animate-pulse" />
          <div className="h-4 w-24 bg-neutral-300 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">
          {/* CART ITEMS */}
          <div className="flex flex-wrap gap-12 py-5 border-y border-neutral-300 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-6 w-fit sm:w-[320px]">
                {/* IMAGE */}
                <div className="w-[220px] h-[300px] bg-neutral-300 animate-pulse" />

                {/* META */}
                <div className="flex flex-col gap-4">
                  <div className="h-4 w-32 bg-neutral-300 animate-pulse" />
                  <div className="h-3 w-24 bg-neutral-200 animate-pulse" />

                  <div className="h-6 w-6 bg-neutral-300 animate-pulse" />
                  <div className="h-6 w-6 bg-neutral-300 animate-pulse" />

                  <div className="h-16 w-10 bg-neutral-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="border bg-[#f3f3f3] p-8 h-fit space-y-6">
            <div className="h-4 w-32 bg-neutral-300 animate-pulse" />

            <div className="space-y-3">
              <div className="h-4 w-full bg-neutral-200 animate-pulse" />
              <div className="h-4 w-full bg-neutral-200 animate-pulse" />
            </div>

            <div className="h-10 w-full bg-neutral-300 animate-pulse mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
