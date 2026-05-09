import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.66 8.83 8.36 9.46-.12-.98-.22-2.48.05-3.55.24-1.02 1.56-6.5 1.56-6.5s-.4-.8-.4-1.98c0-1.85 1.08-3.24 2.42-3.24 1.14 0 1.69.86 1.69 1.88 0 1.14-.73 2.85-1.1 4.44-.31 1.33.66 2.42 1.96 2.42 2.35 0 4.16-2.48 4.16-6.06 0-3.17-2.28-5.38-5.54-5.38-3.77 0-5.98 2.83-5.98 5.75 0 1.14.44 2.36 1 3.02.11.13.12.24.09.37l-.37 1.52c-.06.22-.19.27-.44.16-1.66-.77-2.69-3.19-2.69-5.14 0-4.18 3.04-8.02 8.76-8.02 4.6 0 8.18 3.28 8.18 7.66 0 4.57-2.88 8.24-6.88 8.24-1.35 0-2.61-.7-3.05-1.53l-.83 3.16c-.3 1.16-1.12 2.62-1.67 3.51 1.26.39 2.6.6 4 .6 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Trash Tribe for order help, collaborations, or questions. Reach us by email or the contact form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <div className="flex flex-col gap-8 lg:max-w-lg">
              <h1 className="text-4xl font-bold tracking-[0.14em] tt-text-on-light uppercase sm:text-5xl lg:text-6xl">
                GET IN TOUCH
              </h1>
              <p className="text-[15px] leading-relaxed tracking-[0.04em] tt-text-on-light sm:text-base">
                Questions about your order, collabs, or just want to say hi?
              </p>
              <p>
                <a href="mailto:hello@trashtribe.lol">hello@trashtribe.lol</a>
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href="https://www.instagram.com/trashtribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary"
                >
                  <InstagramIcon />
                  Instagram
                </a>
                <a
                  href="https://www.pinterest.com/trashtribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.14em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary"
                >
                  <PinterestIcon />
                  Pinterest
                </a>
              </div>
            </div>

            <div className="border tt-border-light bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_12%,var(--tt-bg-light))] p-6 sm:p-8 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
