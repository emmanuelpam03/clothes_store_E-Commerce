import { navArrow } from "@/public/assets/images/images";
import Image from "next/image";
import Link from "next/link";
import { config } from "@/constants/config";

export function LandingMinimal() {
  return (
    <section className="relative w-full bg-neutral-200 py-12 sm:py-16 md:py-24">
      <div className="relative mx-auto max-w-7xl px-5">
        <div className="lg:hidden space-y-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 sm:mb-6 text-neutral-400">
              <Image
                src={navArrow}
                alt="nav-arrow"
                width={32}
                height={32}
                className="sm:w-10 sm:h-10"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tracking-tight text-black">
              {config.appName}
            </h1>

            <p className="mt-4 text-xs tracking-wide text-neutral-500">
              Modern essentials for everyday wear
            </p>
          </div>

          <div className="flex flex-col space-y-6 sm:space-y-12 text-xs tracking-widest text-neutral-500">
            <div className="space-y-2">
              <p className="text-neutral-400">SHOP</p>
              <div className="space-y-1">
                <Link href="/products" className="block">
                  PRODUCTS
                </Link>
                <Link href="/products?filter=new" className="block">
                  NEW ARRIVALS
                </Link>
                <Link href="/favorites" className="block">
                  FAVORITES
                </Link>
              </div>{" "}
            </div>

            <div className="space-y-2">
              <p className="text-neutral-400">ACCOUNT</p>
              <div className="space-y-1">
                <Link href="/profile">PROFILE</Link>
                <Link href="/cart">CART</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between">
          <div className="flex flex-col space-y-12 text-xs tracking-widest text-neutral-500">
            <div className="space-y-2">
              <p className="text-neutral-400">INFO</p>
              <div className="space-y-1">
                <Link href="/products">PRODUCTS</Link>
                <Link href="/favorites">FAVORITES</Link>
                <Link href="/profile">PROFILE</Link>
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

          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 text-neutral-400">
              <Image src={navArrow} alt="nav-arrow" width={40} height={40} />
            </div>

            <h1 className="text-6xl font-extrabold leading-none tracking-tight text-black">
              {config.appName}
            </h1>

            <p className="mt-4 text-xs tracking-wide text-neutral-500">
              Modern essentials for everyday wear
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
