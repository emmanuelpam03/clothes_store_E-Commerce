import { navArrow } from "@/public/assets/images/images";
import Image from "next/image";
import Link from "next/link";

export function LandingMinimal() {
  return (
    <section className="relative min-h-screen w-full bg-neutral-200">
      <div className="relative mx-auto max-w-7xl px-5 py-6">
        {/* LEFT INFO */}
        <div className="absolute left-5 top-6 space-y-12 text-xs tracking-widest text-neutral-500">
          <div className="space-y-2 pt-20">
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
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          {/* ICON */}
          <div className="mb-6 text-neutral-400 text-4xl"><Image src={navArrow} alt="nav-arrow" /></div>

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
        <div className="absolute right-5 top-32 space-y-2 text-xs tracking-widest text-neutral-400">
          <p>TECHNOLOGIES</p>
        </div>
      </div>
    </section>
  );
}
