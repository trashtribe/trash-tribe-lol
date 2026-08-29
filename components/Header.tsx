"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { NavPreviewData, StoreCategory } from "@/lib/products";
import { useCart } from "./CartProvider";
import { useSearchModal } from "./SearchModalContext";
import { useWishlist } from "./WishlistProvider";

type FlyoutCategory = Extract<StoreCategory, "UNDERWEAR" | "ACCESSORIES">;

type NavItem = {
  href: string;
  label: string;
  /** Set only for nav items that get a hover flyout / tap accordion. */
  flyoutCategory?: FlyoutCategory;
};

const nav: NavItem[] = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=TSHIRTS", label: "T-Shirts" },
  { href: "/shop?category=ACCESSORIES", label: "Accessories", flyoutCategory: "ACCESSORIES" },
  { href: "/shop?category=UNDERWEAR", label: "Underwear", flyoutCategory: "UNDERWEAR" },
  { href: "/shop?category=POSTERS", label: "Posters" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function AccountIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6.5-4 8-4s6.5 0 8 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

const CATEGORY_LABEL: Record<FlyoutCategory, string> = {
  UNDERWEAR: "Underwear",
  ACCESSORIES: "Accessories",
};

export function Header() {
  const { user } = useAuth();
  const { itemCount, openCart } = useCart();
  const { openSearch } = useSearchModal();
  const { count: wishlistCount } = useWishlist();

  const [preview, setPreview] = useState<NavPreviewData | null>(null);
  const [openCategory, setOpenCategory] = useState<FlyoutCategory | null>(null);
  const [mobileOpenCategory, setMobileOpenCategory] = useState<FlyoutCategory | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/nav-preview")
      .then((res) => (res.ok ? (res.json() as Promise<NavPreviewData>) : null))
      .then((data) => {
        if (!cancelled && data) setPreview(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const accountHref = user ? "/account" : "/login";
  const activeFlyout = openCategory ? preview?.[openCategory] : undefined;

  return (
    <header className="sticky top-0 z-[100] border-b tt-border-light bg-background">
      <div className="relative" onMouseLeave={() => setOpenCategory(null)}>
        <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/" className="block shrink-0 justify-self-start leading-none" aria-label="trashtribe">
            <Image
              src="/tt.png"
              alt="trashtribe"
              width={61}
              height={72}
              priority
              style={{ width: '61px', height: 'auto' }}
              className="block object-contain object-left"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-10">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setOpenCategory(item.flyoutCategory ?? null)}
                className="text-[11px] font-bold tracking-[0.2em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary lg:text-[12px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-3">
            <Link
              href={accountHref}
              className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary"
              aria-label={user ? "Account" : "Sign in"}
            >
              <AccountIcon />
            </Link>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary"
              aria-label="Search"
              onClick={openSearch}
            >
              <SearchIcon />
            </button>
            <Link
              href="/wishlist"
              className="relative inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <HeartIcon />
              {wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center tt-bg-primary px-1 text-[10px] font-bold leading-none tt-text-on-light">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="relative inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary"
              aria-label={`Shopping cart, ${itemCount} items`}
              onClick={openCart}
            >
              <CartIcon />
              {itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center tt-bg-primary px-1 text-[10px] font-bold leading-none tt-text-on-light">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Desktop hover flyout — subcategory links + a few product shots,
            only for nav items that actually split into subcategories. */}
        {openCategory && activeFlyout ? (
          <div className="absolute inset-x-0 top-full z-40 hidden border-t tt-border-light bg-background shadow-sm md:block">
            <div className="mx-auto flex max-w-[1600px] gap-12 px-6 py-8 lg:px-10">
              {activeFlyout.products.length > 0 ? (
                <div className="flex flex-1 gap-6">
                  {activeFlyout.products.map((p) => (
                    <Link key={p.slug} href={`/shop/${p.slug}`} className="group w-full max-w-[180px]">
                      <div className="relative aspect-square w-full overflow-hidden border tt-border-light bg-background">
                        <Image
                          src={p.imageSrc}
                          alt={p.imageAlt}
                          fill
                          sizes="180px"
                          className="object-contain p-3 transition-transform group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 truncate text-[11px] font-bold tracking-[0.05em] tt-text-on-light uppercase">
                        {p.name}
                      </p>
                      <p className="text-[11px] tt-text-on-light">{p.price}</p>
                    </Link>
                  ))}
                </div>
              ) : null}

              <ul className="flex min-w-[140px] shrink-0 flex-col items-end gap-3 text-right">
                <li>
                  <Link
                    href={`/shop?category=${openCategory}`}
                    className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary"
                  >
                    All {CATEGORY_LABEL[openCategory]}
                  </Link>
                </li>
                {activeFlyout.subcategories.map((sub) => (
                  <li key={sub.value}>
                    <Link
                      href={`/shop?category=${openCategory}&subcategory=${sub.value}`}
                      className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary"
                    >
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <nav aria-label="Primary mobile" className="flex flex-col gap-2 border-t tt-border-light px-4 py-3 md:hidden">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {nav.map((item) => {
            if (!item.flyoutCategory) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[10px] font-bold tracking-[0.2em] tt-text-on-light uppercase hover:tt-text-secondary"
                >
                  {item.label}
                </Link>
              );
            }

            const category = item.flyoutCategory;
            const isOpen = mobileOpenCategory === category;
            return (
              <button
                key={item.label}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setMobileOpenCategory(isOpen ? null : category)}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors hover:tt-text-secondary ${
                  isOpen ? "tt-text-secondary" : "tt-text-on-light"
                }`}
              >
                {item.label} {isOpen ? "−" : "+"}
              </button>
            );
          })}
        </div>

        {mobileOpenCategory && preview?.[mobileOpenCategory] ? (
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 border-t tt-border-light pt-2">
            <Link
              href={`/shop?category=${mobileOpenCategory}`}
              className="text-[10px] font-bold tracking-[0.16em] tt-text-on-light uppercase hover:tt-text-secondary"
            >
              All {CATEGORY_LABEL[mobileOpenCategory]}
            </Link>
            {preview[mobileOpenCategory]!.subcategories.map((sub) => (
              <Link
                key={sub.value}
                href={`/shop?category=${mobileOpenCategory}&subcategory=${sub.value}`}
                className="text-[10px] font-bold tracking-[0.16em] tt-text-on-light uppercase hover:tt-text-secondary"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
