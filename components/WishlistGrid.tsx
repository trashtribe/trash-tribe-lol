"use client";

import type { ReactNode } from "react";

import { products } from "./product-data";
import { WishlistProductCard } from "./WishlistProductCard";
import { useWishlist } from "./WishlistProvider";

type WishlistGridProps = {
  emptyAction: ReactNode;
};

export function WishlistGrid({ emptyAction }: WishlistGridProps) {
  const { ids, hydrated } = useWishlist();

  const wishlistProducts = hydrated
    ? ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[1600px]">
        {!hydrated ? null : wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
            <p className="text-lg font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-xl">
              YOUR WISHLIST IS EMPTY
            </p>
            {emptyAction}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
