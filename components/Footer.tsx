import Link from "next/link";

import { isCategoryHidden } from "@/lib/categories";
import { DISCORD_INVITE_URL } from "@/lib/site";

import { NewsletterForm } from "./NewsletterForm";

const allQuickLinks = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=TOPS", label: "Tops" },
  { href: "/shop?category=ACCESSORIES", label: "Accessories" },
  { href: "/shop?category=UNDERWEAR", label: "Underwear" },
  { href: "/about", label: "About" },
  { href: "mailto:hello@trashtribe.lol", label: "hello@trashtribe.lol" },
  { href: DISCORD_INVITE_URL, label: "Discord community & support" },
] as const;

const quickLinks = allQuickLinks.filter((link) => {
  const category = link.href.startsWith("/shop?")
    ? new URLSearchParams(link.href.split("?")[1]).get("category")
    : null;
  return !category || !isCategoryHidden(category);
});

const legalLinks = [
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

function isExternal(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-28 border-t tt-border-dark tt-bg-dark px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-[1600px] gap-14 md:grid-cols-2 md:gap-20">
        <div>
          <h2 className="tt-text-secondary text-[11px] font-bold tracking-[0.2em] uppercase">Quick links</h2>
          <nav aria-label="Footer" className="mt-6">
            <ul className="flex flex-col gap-3 text-[12px] tracking-[0.08em]">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("mailto:") || isExternal(item.href) ? (
                    <a
                      href={item.href}
                      className="tt-text-on-dark transition-colors hover:tt-text-secondary"
                      {...(isExternal(item.href)
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="tt-text-on-dark transition-colors hover:tt-text-secondary">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div id="newsletter" className="scroll-mt-28 md:justify-self-end">
          <h2 className="tt-text-secondary text-[11px] font-bold tracking-[0.2em] uppercase">Newsletter</h2>
          <p className="mt-3 max-w-md text-[12px] leading-relaxed tracking-[0.06em] tt-text-on-dark">Drops and restocks. No spam.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1600px] flex-col items-center gap-4 border-t tt-border-dark pt-8 sm:flex-row sm:justify-between">
        <p className="text-center text-[10px] tracking-[0.12em] tt-text-on-dark sm:text-left">
          © {new Date().getFullYear()} trashtribe. All rights reserved.
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] tracking-[0.12em]">
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="tt-text-on-dark transition-colors hover:tt-text-secondary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
