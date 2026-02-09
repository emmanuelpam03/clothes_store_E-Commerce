export default function NewCollectionHeroSkeleton() {
  return (
    <>
      {/* MOBILE / TABLET SLIDER SKELETON */}
      <div className="lg:hidden relative overflow-hidden -mx-5 px-5">
        <div className="flex gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="relative h-[350px] sm:h-[380px] md:h-[400px] bg-neutral-300 animate-shimmer shrink-0"
              style={{
                width: "calc((100% - 16px) / 1)",
                animationDelay: `${i * 120}ms`,
              }}
            >
              {/* FAVORITE ICON PLACEHOLDER */}
              <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP SLIDER SKELETON */}
      <div className="hidden lg:block">
        <div className="flex">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="relative h-[450px] w-[345px] bg-neutral-300 animate-shimmer mr-8 last:mr-0"
            >
              {/* FAVORITE ICON PLACEHOLDER */}
              <div className="absolute top-4 right-4 h-9 w-9 rounded-full bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
