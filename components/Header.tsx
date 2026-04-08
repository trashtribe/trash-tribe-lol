import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "#shop", label: "Shop" },
  { href: "#shop", label: "Apparel" },
  { href: "#shop", label: "Accessories" },
  { href: "#contact", label: "Contact" },
] as const;

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

export function Header() {
  return (
    <header className="sticky top-0 z-[100] border-b tt-border-light bg-background">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="block shrink-0 justify-self-start leading-none" aria-label="Trash Tribe">
          <Image
            src="/tt.png"
            alt="Trash Tribe"
            width={520}
            height={130}
            className="block h-[72px] w-auto max-w-[min(52vw,320px)] object-contain object-left sm:h-[84px] sm:max-w-[380px] lg:h-[96px] lg:max-w-[440px]"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex lg:gap-10">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] font-bold tracking-[0.2em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary lg:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <button type="button" className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Account">
            <AccountIcon />
          </button>
          <button type="button" className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Search">
            <SearchIcon />
          </button>
          <button type="button" className="relative inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Wishlist, 3 items">
            <HeartIcon />
            <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center tt-bg-primary px-1 text-[10px] font-bold leading-none tt-text-on-light">
              3
            </span>
          </button>
          <button type="button" className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Shopping cart">
            <CartIcon />
          </button>
        </div>
      </div>

      <nav aria-label="Primary mobile" className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t tt-border-light px-4 py-3 md:hidden">
        {nav.map((item) => (
          <Link key={item.label} href={item.href} className="text-[10px] font-bold tracking-[0.2em] tt-text-on-light uppercase hover:tt-text-secondary">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
