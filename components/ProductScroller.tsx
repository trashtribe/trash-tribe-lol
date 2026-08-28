"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { StoreProduct } from "@/lib/products";

type ProductScrollerProps = {
  products: StoreProduct[];
};

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductCard({
  product,
  index,
  hidden = false,
}: {
  product: StoreProduct;
  index: number;
  hidden?: boolean;
}) {
  // Neither Printify's `category` inference nor raw gallery-image count is a
  // reliable signal here: briefs/keychains/tees are all "front print, blank
  // back mockup" (one real photo) despite having 2+ gallery images, while
  // tees can rack up dozens of lifestyle/person shots and still only show
  // one real design. Checked against the actual catalog, socks are the one
  // product type that genuinely has multiple distinct photos worth swapping
  // between — everything else (tees, tanks, briefs, keychains, bags) only
  // has one real shot, so it scales + tilts instead.
  const altImage = product.galleryImages[1];
  const isSock = /\bsocks?\b/i.test(product.name);
  const useImageSwap = isSock && Boolean(altImage);

  const cardStyle: CSSProperties & Record<"--tt-rotate", string> = {
    "--tt-rotate": index % 2 === 0 ? "-2deg" : "2deg",
  };

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="tt-scroller-item"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
    >
      <article
        className={`group flex w-[220px] flex-col sm:w-[260px] ${useImageSwap ? "" : "tt-scroller-card"}`}
        style={useImageSwap ? undefined : cardStyle}
      >
        <div className="relative h-[220px] overflow-hidden border tt-border-light bg-background sm:h-[260px]">
          {product.saleTag ? (
            <span className="absolute left-2 top-2 z-[5] tt-bg-primary px-2 py-1 text-[9px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
              {product.saleTag}
            </span>
          ) : null}
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            className={`object-contain object-center p-3 ${useImageSwap ? "transition-opacity duration-300 group-hover:opacity-0" : ""}`}
            sizes="(max-width: 640px) 60vw, 260px"
          />
          {useImageSwap ? (
            <Image
              src={altImage!}
              alt={product.imageAlt}
              fill
              aria-hidden="true"
              className="object-contain object-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              sizes="(max-width: 640px) 60vw, 260px"
            />
          ) : null}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <h3 className="text-[11px] font-bold tracking-[0.06em] tt-text-on-light uppercase leading-snug sm:text-[12px]">
            {product.name}
          </h3>
          <p className="text-[11px] font-bold tracking-[0.05em] tt-text-on-light sm:text-[12px]">
            {product.price}
          </p>
        </div>
      </article>
    </Link>
  );
}

/**
 * Full catalog in a carousel that both auto-advances and can be driven by
 * hand — trackpad/touch scroll, or the prev/next buttons. It's a real
 * horizontally-scrolling container (not just a CSS animation): content is
 * duplicated 2x and a scroll handler snaps scrollLeft back into range at
 * either edge, so it loops seamlessly whichever direction you move it.
 */
export function ProductScroller({ products }: ProductScrollerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wrap = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    if (track.scrollLeft <= 0) {
      track.scrollLeft += half;
    } else if (track.scrollLeft >= half * 2 - track.clientWidth - 1) {
      track.scrollLeft -= half;
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Start partway into the first copy so there's room to scroll backward
    // too (content is duplicated 2x for the seamless loop).
    track.scrollLeft = track.scrollWidth / 4;
  }, [products]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    const step = () => {
      if (!pausedRef.current) {
        track.scrollLeft += 0.6;
        wrap();
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [wrap]);

  const pauseBriefly = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 2200);
  }, []);

  const scrollByCards = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current;
      if (!track) return;
      pauseBriefly();
      track.scrollBy({ left: direction * 280, behavior: "smooth" });
    },
    [pauseBriefly],
  );

  if (products.length === 0) return null;

  return (
    <section className="relative border-b tt-border-light bg-background px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex justify-center sm:mb-10">
          <Link
            href="/shop"
            className="tt-bg-primary inline-flex min-w-[280px] items-center justify-center px-20 py-7 text-lg font-bold tracking-[0.3em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 sm:min-w-[340px] sm:px-24 sm:py-8 sm:text-xl"
          >
            Shop
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Previous products"
            className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 tt-bg-dark p-2 tt-text-primary transition-opacity hover:opacity-80 sm:left-2 sm:flex"
          >
            <ChevronLeftIcon />
          </button>

          <div
            ref={trackRef}
            className="tt-carousel-scroll gap-5 py-6 sm:gap-6 sm:py-8"
            onPointerEnter={() => {
              pausedRef.current = true;
            }}
            onPointerLeave={() => {
              pausedRef.current = false;
            }}
            onScroll={wrap}
          >
            {products.map((product, i) => (
              <ProductCard key={`a-${product.id}`} product={product} index={i} />
            ))}
            {products.map((product, i) => (
              <ProductCard key={`b-${product.id}`} product={product} index={i} hidden />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Next products"
            className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 tt-bg-dark p-2 tt-text-primary transition-opacity hover:opacity-80 sm:right-2 sm:flex"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
