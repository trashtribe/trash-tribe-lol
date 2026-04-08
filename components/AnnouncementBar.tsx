import Link from "next/link";

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="12" cy="12" r="4" />
      <path d="M16.5 7.5h.01" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.994-.284 1.192.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export function AnnouncementBar() {
  return (
    <div className="border-b tt-border-light bg-background text-[12px] font-bold tracking-[0.12em] tt-text-on-light">
      <div className="mx-auto grid max-w-[1600px] grid-cols-3 items-center gap-4 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-4 justify-self-start">
          <Link href="https://instagram.com" className="tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <InstagramIcon />
          </Link>
          <Link href="https://pinterest.com" className="tt-text-on-light transition-colors hover:tt-text-secondary" aria-label="Pinterest" target="_blank" rel="noopener noreferrer">
            <PinterestIcon />
          </Link>
        </div>
        <p className="text-center text-[10px] tracking-[0.18em] tt-text-on-light sm:text-[12px]">TRASH TRIBE — INDEPENDENT MERCH</p>
        <p className="justify-self-end text-[11px] tracking-[0.14em] tt-text-on-light sm:text-[12px]">EUR €</p>
      </div>
    </div>
  );
}
