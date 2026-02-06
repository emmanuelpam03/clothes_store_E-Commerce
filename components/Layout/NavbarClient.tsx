"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useOptimistic } from "react";
import { menuIcon, navArrow, heartIcon } from "@/public/assets/images/images";
import { ShoppingBag, UserIcon, LogOut, UserStar } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import RoleBadge from "../ui/role-badge";
import { useCart } from "@/lib/cart/cart";
import type { CartItem } from "@/lib/cart/cart.types";

interface NavbarClientProps {
  session: Session | null;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { items } = useCart();
  const [optimisticItems] = useOptimistic<CartItem[]>(items);

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-neutral-100 ${
        isScrolled ? "border-b border-gray-300" : ""
      }`}
    >
      <div className="mx-auto flex py-3 sm:py-5 max-w-7xl items-center justify-between px-4 sm:px-5">
        {/* LEFT */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-full p-2"
            onClick={() => setIsMenuOpen((prev) => !prev)}
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
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link href="/collections" onClick={() => setIsMenuOpen(false)}>
                  Collections
                </Link>
                <Link href="/new" onClick={() => setIsMenuOpen(false)}>
                  New
                </Link>
              </div>
            </nav>
          )}
        </div>

        {/* CENTER LOGO */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
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

          {/* CART (Desktop) */}
          <Link
            href="/cart"
            className="relative hidden sm:flex items-center rounded-full border px-3 py-1.5 text-sm shadow-md shadow-black/20 hover:shadow-xl transition-shadow"
          >
            <span className="bg-black rounded-full px-4 py-2 text-white">
              Cart
            </span>
            <div className="relative flex h-10 w-10 -ml-1 items-center justify-center rounded-full border-4 border-black">
              <ShoppingBag className="text-black h-3 w-3" />
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                {optimisticItems.length}
              </span>
            </div>
          </Link>

          {/* CART (Mobile) */}
          <Link
            href="/cart"
            className="sm:hidden relative flex rounded-full h-9 w-9 bg-black items-center justify-center"
          >
            <ShoppingBag className="text-white h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white text-black text-xs flex items-center justify-center">
              {optimisticItems.length}
            </span>
          </Link>

          {/* PROFILE DROPDOWN */}
          {session ? (
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex gap-2 px-3 py-1.5 justify-center items-center rounded-full shadow-md shadow-black/20 hover:shadow-xl transition-shadow cursor-pointer"
              >
                <button
                  className="flex rounded-full h-9 w-9 bg-black items-center justify-center overflow-hidden"
                  aria-label="User menu"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover cursor-pointer"
                      unoptimized
                    />
                  ) : (
                    <UserIcon
                      className="text-white cursor-pointer"
                      width={18}
                      height={18}
                    />
                  )}
                </button>
                {/* <p>{session.user?.name?.split(" ")[0]}</p> */}
                <p className="flex items-center text-sm font-medium">
                  {session?.user?.name?.split(" ")[0]}
                  <RoleBadge role={session?.user?.role} />
                </p>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-xl border border-gray-200 z-50">
                  {session?.user?.role === "ADMIN" && (
                    <Link href={"/admin"}>
                      <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100">
                        <UserStar className="h-4 w-4" />
                        Admin
                      </div>
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-100 rounded-b-xl cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 md:px-5 md:py-3 border rounded-full shadow-md shadow-black/20 hover:shadow-xl transition-shadow cursor-pointer"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
