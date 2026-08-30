import Link from "next/link";

const CATEGORY_LINKS = [
  { href: "/shop?category=TOPS", label: "Tops" },
  { href: "/shop?category=ACCESSORIES", label: "Accessories" },
  { href: "/shop?category=UNDERWEAR", label: "Underwear" },
  { href: "/shop?category=POSTERS", label: "Posters" },
] as const;

/**
 * Closing category links right before the footer — bigger type than the
 * top-of-scroller nav, each one lifting on hover to invite a click.
 */
export function CategoryLinksCta() {
  return (
    <div className="bg-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 sm:gap-10">
        <span className="h-[2px] w-full tt-bg-dark" aria-hidden="true" />
        <nav
          aria-label="Shop by category"
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-16"
        >
          {CATEGORY_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-block text-xl font-bold tracking-[0.14em] tt-text-on-light uppercase transition-transform duration-200 hover:-translate-y-1.5 hover:text-[color:var(--tt-accent-secondary)] sm:text-2xl md:text-3xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="h-[2px] w-full tt-bg-dark" aria-hidden="true" />
      </div>
    </div>
  );
}
