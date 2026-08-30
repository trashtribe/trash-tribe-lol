import Link from "next/link";

/**
 * Second callout between the product row and the category links —
 * bigger and bouncier than SHOP ALL so it reads as its own moment.
 */
export function JoinTribeCta() {
  return (
    <div className="flex items-center justify-center bg-background px-4 py-16 sm:px-6 sm:py-24">
      <span className="tt-join-bounce inline-block">
        <Link
          href="/shop"
          className="tt-bg-secondary inline-flex items-center gap-5 px-12 py-7 text-xl font-bold tracking-[0.2em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 hover:rotate-2 sm:gap-8 sm:px-20 sm:py-9 sm:text-3xl"
        >
          <span aria-hidden="true">→</span>
          Join our queer tribe
          <span aria-hidden="true">→</span>
        </Link>
      </span>
    </div>
  );
}
