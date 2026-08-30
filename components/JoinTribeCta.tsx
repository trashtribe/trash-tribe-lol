import Link from "next/link";

/**
 * Second callout between the product row and the category links — same
 * idle-bounce treatment as the SHOP ALL button (wrapper handles the bounce,
 * link handles its own hover reaction) so both animate independently.
 */
export function JoinTribeCta() {
  return (
    <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-6 sm:py-14">
      <span className="tt-shop-all-bounce inline-block">
        <Link
          href="/shop"
          className="tt-bg-secondary inline-flex items-center gap-4 px-10 py-5 text-base font-bold tracking-[0.2em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 hover:rotate-2 sm:gap-6 sm:px-14 sm:py-6 sm:text-lg"
        >
          <span aria-hidden="true">→</span>
          Join our queer tribe
          <span aria-hidden="true">→</span>
        </Link>
      </span>
    </div>
  );
}
