"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  whiteShirt1,
  whiteShirt2,
  whiteShirt3,
  whiteShirt4,
  whiteShirt5,
} from "@/public/assets/images/images";
import Link from "next/link";

type Product = {
  image: StaticImageData;
  name: string;
  price: string;
};

const PRODUCTS: Product[] = [
  {
    image: whiteShirt1,
    name: "Basic Slim Fit T-Shirt",
    price: "$99",
  },
  {
    image: whiteShirt2,
    name: "Blurred Print T-Shirt",
    price: "$99",
  },
  {
    image: whiteShirt3,
    name: "Full Sleeve Zipper",
    price: "$99",
  },
  {
    image: whiteShirt4,
    name: "Crewneck T-Shirt",
    price: "$99",
  },
  {
    image: whiteShirt5,
    name: "Crewneck T-Shirt",
    price: "$99",
  },
];

export function NewThisWeek() {
  const trackRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(4);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // Responsive card count
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(PRODUCTS.length - visible, 0);

  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // Drag logic
  const onStart = (x: number) => setDragStart(x);
  const onMove = (x: number) => {
    if (dragStart !== null) setDragOffset(x - dragStart);
  };
  const onEnd = () => {
    if (dragOffset > 80) prev();
    if (dragOffset < -80) next();
    setDragStart(null);
    setDragOffset(0);
  };

  return (
    <section className="w-full bg-neutral-100 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-5">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
            NEW <br className="hidden sm:block" /> THIS WEEK{" "}
            <span className="text-sm font-bold text-blue-600">(50)</span>
          </h2>
          <Link
            href="/"
            className="text-xs sm:text-sm text-black hover:underline"
          >
            See All
          </Link>
        </div>

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
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(calc(-${
                index * (100 / visible)
              }% + ${dragOffset}px))`,
            }}
          >
            {PRODUCTS.map((product, i) => (
              <Link
                href="/"
                key={i}
                className="shrink-0 pr-4 last:pr-0"
                style={{ width: `${100 / visible}%` }}
              >
                {/* CARD */}
                <div className="relative h-[280px] sm:h-[320px] md:h-[360px] bg-white overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />

                  {/* ADD */}
                  <button className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full text-black bg-white px-3 py-1 text-sm cursor-pointer">
                    +
                  </button>
                </div>

                <div className="mt-3 text-xs sm:text-sm text-black">
                  <p className="font-medium">{product.name}</p>
                  <p className="font-semibold">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={prev}
            disabled={index === 0}
            className="h-8 w-8 border disabled:opacity-30 disabled:cursor-default text-black cursor-pointer"
          >
            ←
          </button>
          <button
            onClick={next}
            disabled={index === maxIndex}
            className="h-8 w-8 border disabled:opacity-30 disabled:cursor-default text-black cursor-pointer"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
