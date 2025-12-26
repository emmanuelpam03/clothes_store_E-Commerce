import { navArrow } from "@/public/assets/images/images";
import Image from "next/image";
import Link from "next/link";

export function LandingMinimal() {
  return (
    <section className="relative w-full bg-neutral-200 py-12 sm:py-16 md:py-24">
      <div className="relative mx-auto max-w-7xl px-5">
        {/* Mobile: Stacked */}
        <div className="lg:hidden space-y-8">
          {/* CENTER CONTENT */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* ICON */}
            <div className="mb-4 sm:mb-6 text-neutral-400">
              <Image
                src={navArrow}
                alt="nav-arrow"
                width={32}
                height={32}
                className="sm:w-10 sm:h-10"
              />
            </div>

            {/* TITLE */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tracking-tight text-black">
              XIV <br /> QR
            </h1>

            {/* SUBTEXT */}
            <p className="mt-4 text-xs tracking-wide text-neutral-500">
              Near-field communication
            </p>
          </div>

          {/* LEFT INFO */}
          <div className="flex flex-col space-y-6 sm:space-y-12 text-xs tracking-widest text-neutral-500">
            <div className="space-y-2">
              <p className="text-neutral-400">INFO</p>
              <div className="space-y-1">
                <Link href="/pricing">PRICING</Link>
                <Link href="/about">ABOUT</Link>
                <Link href="/contacts">CONTACTS</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-neutral-400">LANGUAGES</p>
              <div className="space-y-1">
                <button>ENG</button>
                <button>ESP</button>
                <button>SVE</button>
              </div>
            </div>
          </div>

          {/* RIGHT META */}
          <div className="flex flex-col space-y-2 text-xs tracking-widest text-neutral-400">
            <p>TECHNOLOGIES</p>
          </div>
        </div>

        {/* Desktop: Horizontal */}
        <div className="hidden lg:flex items-center justify-between">
          {/* LEFT INFO */}
          <div className="flex flex-col space-y-12 text-xs tracking-widest text-neutral-500">
            <div className="space-y-2">
              <p className="text-neutral-400">INFO</p>
              <div className="space-y-1">
                <Link href="/pricing">PRICING</Link>
                <Link href="/about">ABOUT</Link>
                <Link href="/contacts">CONTACTS</Link>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-neutral-400">LANGUAGES</p>
              <div className="space-y-1">
                <button>ENG</button>
                <button>ESP</button>
                <button>SVE</button>
              </div>
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* ICON */}
            <div className="mb-6 text-neutral-400">
              <Image src={navArrow} alt="nav-arrow" width={40} height={40} />
            </div>

            {/* TITLE */}
            <h1 className="text-6xl font-extrabold leading-none tracking-tight text-black">
              XIV <br /> QR
            </h1>

            {/* SUBTEXT */}
            <p className="mt-4 text-xs tracking-wide text-neutral-500">
              Near-field communication
            </p>
          </div>

          {/* RIGHT META */}
          <div className="flex flex-col space-y-2 text-xs tracking-widest text-neutral-400">
            <p>TECHNOLOGIES</p>
          </div>
        </div>
      </div>
    </section>
  );
}
