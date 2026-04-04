import Link from "next/link";

const nav = [
  { href: "#shop", label: "Shop" },
  { href: "#shop", label: "Apparel" },
  { href: "#shop", label: "Accessories" },
  { href: "#contact", label: "Contact" },
] as const;

function AccountIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 6.5-4 8-4s6.5 0 8 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-[100] border-b border-[#111111]/15 bg-[#ffffff] shadow-[0_1px_0_0_rgba(17,17,17,0.06)]">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="justify-self-start bg-gradient-to-r from-[#f0325a] via-[#000000] to-[#f0325a] bg-clip-text font-bold text-xl tracking-[0.08em] text-transparent uppercase sm:text-2xl"
        >
          Trash Tribe
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex lg:gap-10"
        >
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[11px] font-bold tracking-[0.2em] text-[#111111] uppercase transition-colors hover:text-[#f0325a] lg:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-[#111111] transition-colors hover:text-[#f0325a]"
            aria-label="Account"
          >
            <AccountIcon />
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-[#111111] transition-colors hover:text-[#f0325a]"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            className="relative inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-[#111111] transition-colors hover:text-[#f0325a]"
            aria-label="Wishlist, 3 items"
          >
            <HeartIcon />
            <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center bg-[#f0325a] px-1 text-[10px] font-bold leading-none text-[#ffffff]">
              3
            </span>
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-[#111111] transition-colors hover:text-[#f0325a]"
            aria-label="Shopping cart"
          >
            <CartIcon />
          </button>
        </div>
      </div>
      <nav
        aria-label="Primary mobile"
        className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-[#111111]/15 px-4 py-3 md:hidden"
      >
        {nav.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-[10px] font-bold tracking-[0.2em] text-[#111111] uppercase hover:text-[#f0325a]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
