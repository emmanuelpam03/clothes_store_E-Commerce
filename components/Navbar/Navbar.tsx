// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  menuIcon,
  navArrow,
  heartIcon,
  // userIcon,
  // shoppingbag,
} from "@/public/assets/images/images";
import { ShoppingBag, UserIcon } from "lucide-react";

export function Navbar() {
  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex py-5 max-w-7xl items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button aria-label="Open menu" className="rounded-full p-2">
            <Image src={menuIcon} alt="menu" width={20} height={20} />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-black text-base tracking-wide font-medium">
            <Link href="/">Home</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/new">New</Link>
          </nav>
        </div>

        {/* CENTER */}
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Image src={navArrow} alt="logo" width={30} height={30} />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          <Link
            href="/favorites"
            className="rounded-full p-3 bg-black text-white"
          >
            <Image src={heartIcon} alt="heart" width={18} height={18} />
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            className="relative flex items-center rounded-full border px-3 py-1.5 text-sm shadow-md shadow-black/20 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-center">
              <span className=" bg-black rounded-full px-4 py-2 text-white text-base tracking-wide font-medium">
                Cart
              </span>
              <div className="relative flex h-10 w-10 -ml-1 items-center justify-center rounded-full border-6 border-black">
                {/* <Image
                  src={shoppingbag}
                  alt="shoppingbag"
                  width={16}
                  height={16}
                /> */}
                <ShoppingBag className="text-black h-3 w-3" />
                <span className="absolute flex -top-2 -right-2 rounded-full h-5 w-5 items-center justify-center bg-black px-2 text-base tracking-wide text-white">
                  0
                </span>
              </div>
            </div>
          </Link>

          <button className="flex rounded-full h-9 w-9 bg-black items-center justify-center">
            {/* <Image src={userIcon} alt="user" width={18} height={18} /> */}
            <UserIcon className="text-white" width={18} height={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
