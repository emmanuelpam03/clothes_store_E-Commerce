import Image from "next/image";
import {
  whiteShirt1,
  approach1,
  approach2,
  soldierShirt,
} from "@/public/assets/images/images";

export function OurApproach() {
  return (
    <section className="w-full bg-neutral-100 py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* HEADER */}
        <div className="mx-auto mb-12 sm:mb-16 md:mb-20 max-w-3xl text-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide text-black">
            OUR APPROACH TO FASHION DESIGN
          </h2>

          <p className="mt-4 sm:mt-6 text-xs sm:text-sm leading-relaxed tracking-wide text-neutral-600">
            At elegant vogue, we blend creativity with craftsmanship to create
            fashion that transcends trends and stands the test of time. Each
            design is meticulously crafted, ensuring the highest quality
            exquisite finish.
          </p>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          {/* IMAGE 1 */}
          <div className="sm:col-span-1 lg:col-span-3">
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px] bg-white">
              <Image
                src={approach1}
                alt="Editorial look 1"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 2 (TALLER) */}
          <div className="sm:col-span-1 lg:col-span-3 lg:mt-16">
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px] bg-white">
              <Image
                src={approach2}
                alt="Editorial look 2"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 3 */}
          <div className="sm:col-span-1 lg:col-span-3">
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px] bg-white">
              <Image
                src={whiteShirt1}
                alt="Editorial look 3"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 4 */}
          <div className="sm:col-span-1 lg:col-span-3 lg:mt-16">
            <div className="relative h-[300px] sm:h-[360px] md:h-[420px] bg-white">
              <Image
                src={soldierShirt}
                alt="Editorial look 4"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
