"use client";

import {
  blackShirt1,
  rightArrow,
  whiteShirt1,
} from "@/public/assets/images/images";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const SLIDES = [whiteShirt1, blackShirt1, whiteShirt1, blackShirt1];

const SLIDE_WIDTH = 345;
const GAP = 32;
const STEP = SLIDE_WIDTH + GAP;
const DRAG_THRESHOLD = 80;

export function NewCollectionHero() {
  const [index, setIndex] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const prev = () => {
    setIndex((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
  };

  const next = () => {
    setIndex((i) => (i === SLIDES.length - 1 ? 0 : i + 1));
  };

  // 🔹 Drag logic
  const onStart = (x: number) => setDragStart(x);

  const onMove = (x: number) => {
    if (dragStart !== null) {
      setDragOffset(x - dragStart);
    }
  };

  const onEnd = () => {
    if (dragOffset > DRAG_THRESHOLD) prev();
    if (dragOffset < -DRAG_THRESHOLD) next();
    setDragStart(null);
    setDragOffset(0);
  };

  return (
    <section className="w-full bg-white px-5">
      <div className="w-full mx-auto grid max-w-7xl grid-cols-12 gap-8 py-16">
        {/* LEFT COLUMN */}
        <div className="col-span-5 flex flex-col justify-between">
          {/* TOP */}
          <div className="space-y-6">
            <nav className="flex flex-col space-y-1 text-xs tracking-widest text-black">
              <Link href="/men">MEN</Link>
              <Link href="/women">WOMEN</Link>
              <Link href="/kids">KIDS</Link>
            </nav>

            <div className="flex w-64 items-center gap-2 rounded bg-neutral-200 px-3 py-2 text-xs text-black">
              <SearchIcon size={14} />
              <input
                type="text"
                placeholder="Search"
                className="text-black outline-none border-none w-full"
              />
            </div>
          </div>

          {/* MIDDLE */}
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-black">
              NEW <br /> COLLECTION
            </h1>
            <p className="text-sm tracking-wide text-black">
              Summer <br /> 2025
            </p>
          </div>

          {/* BOTTOM */}
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 rounded bg-neutral-200 px-5 py-2 text-xs font-medium text-black cursor-pointer">
              Go To Shop
              <Image src={rightArrow} alt="arrow" />
            </button>

            <div className="flex gap-2">
              <button
                onClick={prev}
                className="flex h-8 w-8 items-center justify-center rounded border text-black cursor-pointer"
              >
                ←
              </button>
              <button
                onClick={next}
                className="flex h-8 w-8 items-center justify-center rounded border text-black cursor-pointer"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-7 flex flex-col justify-between">
          <div />

          {/* SLIDER */}
          <div
            className="relative overflow-hidden"
            onMouseDown={(e) => onStart(e.clientX)}
            onMouseMove={(e) => onMove(e.clientX)}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={(e) => onStart(e.touches[0].clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
            onTouchEnd={onEnd}
          >
            <div
              className="flex gap-8 transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(calc(-${
                  index * STEP
                }px + ${dragOffset}px))`,
              }}
            >
              {SLIDES.map((img, i) => (
                <Link
                  href="/"
                  key={i}
                  className="relative h-[450px] w-[345px] shrink-0 bg-white"
                >
                  <Image
                    src={img}
                    alt={`slide-${i}`}
                    fill
                    className="object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div />
        </div>
      </div>
    </section>
  );
}
