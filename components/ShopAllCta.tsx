import Link from "next/link";

/**
 * Full-width divider + "SHOP ALL" button — was originally inside the
 * ProductScroller, now the page's closing CTA right before the footer.
 * Colored to match the "JOIN THE TRIBE" pill baked into the hero art.
 */
export function ShopAllCta() {
  return (
    <div className="border-b tt-border-light bg-background px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-[1600px] items-center justify-center gap-4 sm:gap-6">
        <span className="h-[2px] flex-1 tt-bg-dark" aria-hidden="true" />
        <Link
          href="/shop"
          className="tt-bg-tribe-green inline-flex min-w-[280px] shrink-0 rotate-[-2deg] items-center justify-center px-20 py-7 text-lg font-bold tracking-[0.3em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 hover:rotate-0 sm:min-w-[340px] sm:px-24 sm:py-8 sm:text-xl"
        >
          ★ SHOP ALL ★
        </Link>
        <span className="h-[2px] flex-1 tt-bg-dark" aria-hidden="true" />
      </div>
    </div>
  );
}
