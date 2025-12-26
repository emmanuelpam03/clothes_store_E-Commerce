// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  menuIcon,
  navArrow,
  heartIcon,
  // userIcon,
  // shoppingbag,
} from "@/public/assets/images/images";
import { ShoppingBag, UserIcon } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white ${
        isScrolled ? "border-b border-gray-300" : ""
      }`}
    >
      <div className="mx-auto flex py-3 sm:py-5 max-w-7xl items-center justify-between px-4 sm:px-5">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-full p-2"
            onClick={toggleMenu}
          >
            <Image src={menuIcon} alt="menu" width={20} height={20} />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-black text-base tracking-wide font-medium">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/new">New</Link>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <nav className="absolute left-0 top-full w-full bg-white border-b border-gray-200 lg:hidden shadow-lg">
              <div className="mx-auto max-w-7xl px-4 sm:px-5 py-4 flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-black text-base tracking-wide font-medium hover:text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/collections"
                  className="text-black text-base tracking-wide font-medium hover:text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Collections
                </Link>
                <Link
                  href="/new"
                  className="text-black text-base tracking-wide font-medium hover:text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New
                </Link>
              </div>
            </nav>
          )}
        </div>

        {/* CENTER */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image src={navArrow} alt="logo" width={30} height={30} />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            href="/favorites"
            className="rounded-full p-3 bg-black text-white"
          >
            <Image src={heartIcon} alt="heart" width={18} height={18} />
          </Link>

          {/* CART */}
          <Link
            href="/cart"
            className="relative hidden sm:flex items-center rounded-full border px-3 py-1.5 text-sm shadow-md shadow-black/20 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-center">
              <span className="bg-black rounded-full px-4 py-2 text-white text-base tracking-wide font-medium">
                Cart
              </span>
              <div className="relative flex h-10 w-10 -ml-1 items-center justify-center rounded-full border-6 border-black">
                <ShoppingBag className="text-black h-3 w-3" />
                <span className="absolute flex -top-2 -right-2 rounded-full h-5 w-5 items-center justify-center bg-black px-2 text-base tracking-wide text-white">
                  0
                </span>
              </div>
            </div>
          </Link>

          {/* Mobile Cart Icon */}
          <Link
            href="/cart"
            className="sm:hidden relative flex rounded-full h-9 w-9 bg-black items-center justify-center"
          >
            <ShoppingBag className="text-white h-4 w-4" />
            <span className="absolute flex -top-1 -right-1 rounded-full h-4 w-4 items-center justify-center bg-white text-black text-xs font-bold">
              0
            </span>
          </Link>

          <button className="flex rounded-full h-9 w-9 bg-black items-center justify-center">
            <UserIcon className="text-white" width={18} height={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
