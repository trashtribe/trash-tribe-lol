import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { StoreProduct } from "@/lib/products";

type ProductScrollerProps = {
  title?: string;
  products: StoreProduct[];
};

/**
 * Horizontal scroll-snap showcase strip. Cards alternate a slight tilt
 * (via the --tt-rotate custom property, read by .tt-scroller-card:hover
 * in globals.css) so the hover scale + rotate doesn't look uniform.
 */
export function ProductScroller({ title = "T-Shirts", products }: ProductScrollerProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="relative border-b tt-border-light bg-background px-4 py-12 sm:px-6 sm:py-16"
      aria-labelledby="tee-scroller-heading"
    >
      <div className="mx-auto max-w-[1600px]">
        <h2
          id="tee-scroller-heading"
          className="tt-gradient-text mb-8 text-center text-xl font-bold tracking-[0.2em] uppercase sm:mb-10 sm:text-2xl"
        >
          {title}
        </h2>

        <div className="relative">
          <div className="tt-scroller gap-5 px-1 pb-2 sm:gap-6">
            {products.map((product, i) => {
              const cardStyle: CSSProperties & Record<"--tt-rotate", string> = {
                "--tt-rotate": i % 2 === 0 ? "-2deg" : "2deg",
              };

              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="tt-scroller-item"
                >
                  <article
                    className="tt-scroller-card flex w-[220px] flex-col sm:w-[260px]"
                    style={cardStyle}
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
                        className="object-contain object-center p-3"
                        sizes="(max-width: 640px) 60vw, 260px"
                      />
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
            })}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent sm:w-16"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent sm:w-16"
          />
        </div>
      </div>
    </section>
  );
}
