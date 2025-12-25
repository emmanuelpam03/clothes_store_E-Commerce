import Image from "next/image";
import {
  whiteShirt1,
  approach1,
  approach2,
  soldierShirt,
} from "@/public/assets/images/images";

export function OurApproach() {
  return (
    <section className="w-full bg-neutral-100 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-wide text-black">
            OUR APPROACH TO FASHION DESIGN
          </h2>

          <p className="mt-6 text-sm leading-relaxed tracking-wide text-neutral-600">
            At elegant vogue, we blend creativity with craftsmanship to create
            fashion that transcends trends and stands the test of time. Each
            design is meticulously crafted, ensuring the highest quality
            exquisite finish.
          </p>
        </div>

        {/* IMAGE GRID */}
        <div className="grid grid-cols-12 gap-8">
          {/* IMAGE 1 */}
          <div className="col-span-3">
            <div className="relative h-[420px] bg-white">
              <Image
                src={approach1}
                alt="Editorial look 1"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 2 (TALLER) */}
          <div className="col-span-3 mt-16">
            <div className="relative h-[420px] bg-white">
              <Image
                src={approach2}
                alt="Editorial look 2"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 3 */}
          <div className="col-span-3">
            <div className="relative h-[420px] bg-white">
              <Image
                src={whiteShirt1}
                alt="Editorial look 3"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* IMAGE 4 */}
          <div className="col-span-3 mt-16">
            <div className="relative h-[420px] bg-white">
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
