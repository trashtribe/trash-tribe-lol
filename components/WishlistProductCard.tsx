"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatEuro } from "@/lib/format-currency";
import { parseVariantTitleSegments, shouldSwapImageOnHover } from "@/lib/products";

import { useCart } from "./CartProvider";
import type { Product } from "./product-data";
import { useWishlist } from "./WishlistProvider";

type WishlistProductCardProps = {
  product: Product;
};

export function WishlistProductCard({ product }: WishlistProductCardProps) {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();
  const altImage = product.galleryImages[1];
  const useImageSwap = shouldSwapImageOnHover(product);
  // Only mount the swap image once actually hovered — keeps it from being
  // fetched/transformed for every card on every page view (see
  // ShopProductCard for the same fix and the reasoning behind it).
  const [hovered, setHovered] = useState(false);
  const showAltImage = useImageSwap && hovered;

  return (
    <article
      className="group flex flex-col gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-32 overflow-hidden border tt-border-light bg-background p-3 sm:h-36 md:h-40">
        <Link
          href={`/shop/${product.slug}`}
          className="relative block h-full w-full"
        >
          <div className="relative h-full w-full">
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              fill
              className={`object-contain object-center transition-opacity duration-300 ${showAltImage ? "opacity-0" : "opacity-100"}`}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            {showAltImage ? (
              <Image
                src={altImage!}
                alt={product.imageAlt}
                fill
                aria-hidden="true"
                className="object-contain object-center"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : null}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => removeFromWishlist(product.id)}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center border tt-border-light bg-background text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
          aria-label={`Remove ${product.name} from wishlist`}
        >
          ×
        </button>
      </div>
      <Link
        href={`/shop/${product.slug}`}
        className="transition-colors hover:tt-text-secondary"
      >
        <h3 className="text-[11px] font-bold tracking-[0.06em] tt-text-on-light uppercase leading-snug sm:text-[12px]">
          {product.name}
        </h3>
        <p className="text-[11px] font-bold tracking-[0.05em] tt-text-on-light sm:text-[12px]">
          {product.price}
        </p>
      </Link>
      <button
        type="button"
        onClick={() => {
          const pick =
            product.category === "TOPS" || product.category === "UNDERWEAR"
              ? product.variants.find((x) => {
                  const { size } = parseVariantTitleSegments(x.title);
                  return size !== null && size.toUpperCase() === "M";
                }) ?? product.variants[0]
              : product.variants[0];

          let lineProduct = product;
          let variantId: number | undefined;
          let size: string | undefined;

          if (pick) {
            lineProduct = {
              ...product,
              price: formatEuro(pick.price / 100),
            };
            variantId = pick.id;
            size = pick.title.trim();
          }

          addToCart({
            product: lineProduct,
            quantity: 1,
            size,
            variantId,
          });
        }}
        className="w-full bg-[color:var(--tt-bg-dark)] px-3 py-2.5 text-[10px] font-bold tracking-[0.16em] tt-text-primary uppercase transition-colors hover:tt-text-secondary"
      >
        Add to cart
      </button>
    </article>
  );
}
