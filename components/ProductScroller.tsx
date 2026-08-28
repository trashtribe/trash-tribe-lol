import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { StoreProduct } from "@/lib/products";

type ProductScrollerProps = {
  products: StoreProduct[];
};

function ProductCard({
  product,
  index,
  hidden = false,
}: {
  product: StoreProduct;
  index: number;
  hidden?: boolean;
}) {
  const altImage = product.secondaryImageSrc;
  const useImageSwap = Boolean(altImage);

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
 * Full catalog, auto-scrolling like the marquee banners: the track holds
 * two identical copies of every product and slides -50%, so the loop is
 * seamless. Hover pauses the scroll (via .tt-carousel-track:hover) and,
 * per-card: products with a second gallery photo (a back/alt shot) cross-
 * fade to it on hover; products with only one photo (e.g. most tees) scale
 * up + tilt instead — see ProductCard.
 */
export function ProductScroller({ products }: ProductScrollerProps) {
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

        <div className="tt-carousel">
          <div className="tt-carousel-track gap-5 sm:gap-6">
            {products.map((product, i) => (
              <ProductCard key={`a-${product.id}`} product={product} index={i} />
            ))}
            {products.map((product, i) => (
              <ProductCard key={`b-${product.id}`} product={product} index={i} hidden />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
