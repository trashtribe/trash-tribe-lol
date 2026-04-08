"use client";

import Image from "next/image";
import { useState } from "react";

import type { Product } from "./product-data";
import { ShopProductCard } from "./ShopProductCard";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

const apparelSizes = ["S", "M", "L", "XL"] as const;

type ProductDetailViewProps = {
  product: Product;
  relatedProducts: Product[];
};

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(apparelSizes[1]);

  const gallery = product.galleryImages.slice(0, 4);
  const isApparel = product.category === "APPAREL";

  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="border-b tt-border-light px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-square overflow-hidden border tt-border-light bg-background p-5">
              <Image
                src={gallery[0] ?? product.imageSrc}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
                priority
              />
            </div>
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((imageSrc, idx) => (
                <li key={`${product.id}-thumb-${idx}`}>
                  <div className="relative aspect-square overflow-hidden border tt-border-light bg-background p-2">
                    <Image
                      src={imageSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="25vw"
                      className="object-contain object-center"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-[0.14em] tt-text-on-light uppercase sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-lg text-[color:color-mix(in_srgb,var(--tt-text-on-light)_60%,transparent)] line-through">
                {product.originalPrice}
              </p>
              <p className="text-2xl font-bold tt-text-secondary">{product.price}</p>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed tt-text-on-light sm:text-base">
              {product.description}
            </p>

            {isApparel ? (
              <div className="mt-8">
                <p className="mb-3 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {apparelSizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-11 border px-3 py-2 text-xs font-bold tracking-[0.14em] uppercase transition-colors ${active ? "tt-bg-primary tt-border-light tt-text-on-light" : "tt-border-light tt-text-on-light hover:tt-text-secondary"}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-8">
              <p className="mb-3 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
                Quantity
              </p>
              <div className="inline-flex items-center border tt-border-light">
                <button
                  type="button"
                  className="h-10 w-10 text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="inline-flex h-10 w-10 items-center justify-center text-sm font-bold tt-text-on-light">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="h-10 w-10 text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    product,
                    quantity,
                    size: isApparel ? selectedSize : undefined,
                  })
                }
                className="w-full bg-[color:var(--tt-bg-dark)] px-6 py-4 text-sm font-bold tracking-[0.2em] tt-text-primary uppercase transition-colors hover:tt-text-secondary"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`text-xs font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors ${wishlisted ? "tt-text-secondary" : "tt-text-on-light hover:tt-text-secondary"}`}
              >
                {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </button>
              <p className="text-sm tt-text-on-light">Free shipping over €100</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="mb-8 text-2xl font-bold tracking-[0.18em] tt-text-on-light uppercase sm:text-3xl">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <ShopProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
