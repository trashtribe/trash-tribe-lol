"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useAuth } from "./AuthProvider";
import { WishlistProductCard } from "./WishlistProductCard";
import { useWishlist } from "./WishlistProvider";
import type { StoreProduct } from "@/lib/products";

type WishlistGridProps = {
  products: StoreProduct[];
  emptyAction: ReactNode;
};

function GuestAccountBanner() {
  return (
    <div className="mb-10 flex flex-col items-center gap-3 border border-black/10 bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_10%,white)] px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-sm tt-text-on-light">
        Saved on this device only. Create a free account to keep your
        favourites forever, sync them across devices, and check out faster.
      </p>
      <Link
        href="/login"
        className="shrink-0 border border-black bg-black px-6 py-2.5 text-[11px] font-bold tracking-[0.16em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90"
      >
        Create account
      </Link>
    </div>
  );
}

export function WishlistGrid({ products, emptyAction }: WishlistGridProps) {
  const { ids, hydrated } = useWishlist();
  const { user, loading: authLoading } = useAuth();

  const wishlistProducts = hydrated
    ? ids
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
    : [];

  const showGuestBanner = hydrated && !authLoading && !user;

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[1600px]">
        {showGuestBanner ? <GuestAccountBanner /> : null}
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
