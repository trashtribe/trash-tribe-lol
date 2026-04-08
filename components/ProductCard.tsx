"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "./CartProvider";
import type { Product } from "./product-data";
import { useWishlist } from "./WishlistProvider";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <article className="group flex flex-col border tt-border-light bg-background transition-colors hover:border-[color:var(--tt-accent-secondary)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_35%,var(--tt-bg-light))]">
        <Link href={`/shop/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--tt-text-on-light)_10%,transparent)] via-transparent to-transparent opacity-80" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-2 top-2 z-20 border tt-border-light bg-background/95 p-1.5 transition-colors hover:tt-text-secondary ${saved ? "tt-text-secondary" : "tt-text-on-light"}`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-[color:var(--tt-accent-secondary)] bg-background/95 px-4 py-2.5 text-center opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({ product, quantity: 1 });
            }}
            className="pointer-events-auto text-[11px] font-semibold tracking-[0.28em] tt-text-secondary uppercase"
          >
            Quick add
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t tt-border-light p-4 sm:p-5">
        <Link href={`/shop/${product.slug}`} className="transition-colors hover:tt-text-secondary">
          <h2 className="text-base font-bold tracking-wide tt-text-on-light uppercase sm:text-lg">{product.name}</h2>
          <p className="text-sm tt-text-on-light">{product.price}</p>
        </Link>
      </div>
    </article>
  );
}
