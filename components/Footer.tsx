import Link from "next/link";

import { NewsletterForm } from "./NewsletterForm";

const quickLinks = [
  { href: "#shop", label: "Shop" },
  { href: "#shop", label: "Apparel" },
  { href: "#shop", label: "Accessories" },
  { href: "#contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-28 border-t border-[#111111]/15 bg-[#ffffff] px-4 py-16 sm:px-6"
    >
      <div className="mx-auto grid max-w-[1600px] gap-14 md:grid-cols-2 md:gap-20">
        <div>
          <h2 className="bg-gradient-to-r from-[#f0325a] to-[#ff6b8a] bg-clip-text text-[11px] font-bold tracking-[0.2em] text-transparent uppercase">
            Quick links
          </h2>
          <nav aria-label="Footer" className="mt-6">
            <ul className="flex flex-col gap-3 text-[12px] tracking-[0.08em]">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#444444] transition-colors hover:text-[#f0325a]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div id="newsletter" className="scroll-mt-28 md:justify-self-end">
          <h2 className="bg-gradient-to-r from-[#f0325a] to-[#ff6b8a] bg-clip-text text-[11px] font-bold tracking-[0.2em] text-transparent uppercase">
            Newsletter
          </h2>
          <p className="mt-3 max-w-md text-[12px] leading-relaxed tracking-[0.06em] text-[#444444]">
            Drops and restocks. No spam.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-[1600px] border-t border-[#111111]/10 pt-8">
        <p className="text-center text-[10px] tracking-[0.12em] text-[#888888] sm:text-left">
          © {new Date().getFullYear()} Trash Tribe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
