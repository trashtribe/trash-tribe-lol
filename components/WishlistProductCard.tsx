"use client";

import Image from "next/image";
import Link from "next/link";

import { formatEuro } from "@/lib/format-currency";
import { parseVariantTitleSegments } from "@/lib/products";

import { useCart } from "./CartProvider";
import type { Product } from "./product-data";
import { useWishlist } from "./WishlistProvider";

type WishlistProductCardProps = {
  product: Product;
};

export function WishlistProductCard({ product }: WishlistProductCardProps) {
  const { addToCart } = useCart();
  const { removeFromWishlist } = useWishlist();

  return (
    <article className="flex flex-col gap-2">
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
              className="object-contain object-center"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
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
            product.category === "APPAREL"
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
