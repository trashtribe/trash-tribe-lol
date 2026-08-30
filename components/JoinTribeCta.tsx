import Link from "next/link";

/**
 * Second callout between the product row and the category links — a
 * full-bleed soft-pink band (edge to edge, no white margin), button
 * matching SHOP ALL's exact size.
 */
export function JoinTribeCta() {
  return (
    <div className="flex items-center justify-center bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] px-4 py-8 sm:px-6 sm:py-10">
      <span className="tt-join-bounce inline-block">
        <Link
          href="/shop"
          className="tt-bg-secondary inline-flex min-w-[220px] items-center justify-center gap-2 px-8 py-4 text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase transition-transform duration-200 hover:scale-110 hover:rotate-2 sm:min-w-[340px] sm:gap-6 sm:px-24 sm:py-8 sm:text-xl sm:tracking-[0.3em]"
        >
          <span aria-hidden="true">→</span>
          Join our queer tribe
          <span aria-hidden="true">→</span>
        </Link>
      </span>
    </div>
  );
}
