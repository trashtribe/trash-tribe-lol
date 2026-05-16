"use client";

import Image from "next/image";
import Link from "next/link";

import type { StoreProduct } from "@/lib/products";

import { useCart } from "./CartProvider";
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

type ShopProductCardProps = {
  product: StoreProduct;
};

function quickBuyPayload(product: StoreProduct): {
  product: StoreProduct;
  size?: string;
} {
  if (product.category !== "APPAREL") {
    return { product };
  }
  const v = product.variants[0];
  if (!v) return { product };
  const size =
    v.size && v.size.toLowerCase() !== "one size" && v.size !== "—" ? v.size : undefined;
  return {
    product: { ...product, price: v.price },
    size,
  };
}

export function ShopProductCard({ product }: ShopProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <article className="group flex flex-col">
      <div className="relative h-32 overflow-hidden border tt-border-light bg-background sm:h-36 md:h-40">
        <Link
          href={`/shop/${product.slug}`}
          className="relative block h-full p-3"
        >
          {product.saleTag ? (
            <span className="absolute left-2 top-2 z-[5] tt-bg-primary px-2 py-1 text-[9px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
              {product.saleTag}
            </span>
          ) : null}
          <div className="relative h-full w-full">
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              fill
              className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              const { product: cartProduct, size } = quickBuyPayload(product);
              addToCart({ product: cartProduct, quantity: 1, size });
            }}
            className="absolute bottom-0 left-0 right-0 z-10 translate-y-full tt-bg-primary px-2 py-2 text-center text-[9px] font-bold tracking-[0.18em] tt-text-on-light uppercase transition-transform duration-200 group-hover:translate-y-0"
          >
            Quick buy
          </button>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-2 top-2 z-20 border tt-border-light bg-background p-1.5 transition-colors hover:tt-text-secondary ${saved ? "tt-text-secondary" : "tt-text-on-light"}`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>
      <div className="mt-2.5 flex flex-col gap-1">
        <Link href={`/shop/${product.slug}`} className="block transition-colors hover:tt-text-secondary">
          <h3 className="text-[11px] font-bold tracking-[0.06em] tt-text-on-light uppercase leading-snug sm:text-[12px]">
            {product.name}
          </h3>
          <p className="text-[11px] font-bold tracking-[0.05em] tt-text-on-light sm:text-[12px]">
            {product.price}
          </p>
        </Link>
      </div>
    </article>
  );
}
