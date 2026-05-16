import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const heroImage =
  "https://images.unsplash.com/photo-1519501025264-65baa15a8232?auto=format&fit=crop&w=2400&q=80";

const sideImage =
  "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1400&q=80";

const values = [
  {
    title: "Independent",
    body: "No corporate BS. Trash Tribe is a small, self-run merch line — we make what we like and stand behind it.",
  },
  {
    title: "Sustainable",
    body: "Printed on demand, so we only produce what you order. Less waste, no piles of dead stock in a warehouse.",
  },
  {
    title: "Bold",
    body: "Design that says something. Loud graphics, attitude, and pieces meant to be worn, not watered down for a boardroom.",
  },
] as const;

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Trash Tribe — independent print-on-demand merch, bold design, and on-demand production with less waste.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="relative min-h-[min(72vh,640px)] w-full">
          <Image
            src={heroImage}
            alt="Urban cityscape at night with lights and density"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/30"
            aria-hidden
          />
          <div className="absolute inset-0 flex items-end justify-center px-4 pb-16 pt-24 sm:items-center sm:pb-24 sm:pt-28">
            <h1 className="text-center text-5xl font-bold tracking-[0.22em] tt-text-on-dark uppercase sm:text-6xl md:text-7xl">
              ABOUT US
            </h1>
          </div>
        </section>

        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1600px] items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            <div className="flex flex-col gap-6 lg:max-w-xl">
              <h2 className="text-3xl font-bold tracking-[0.14em] tt-text-on-light uppercase sm:text-4xl">
                WHO WE ARE
              </h2>
              <div className="flex flex-col gap-4 text-[15px] leading-relaxed tracking-[0.04em] tt-text-on-light sm:text-base">
                <p className="text-[15px] font-bold leading-relaxed tracking-[0.04em] tt-text-on-light sm:text-base">
                  trashtribe — early 2000s energy, queer by design, un poco locas, no apologies.
                </p>
                <p>
                  Trash Tribe is an independent merch brand — not a faceless label, just a crew that
                  cares about graphics, quality, and wearing your point of view on your sleeve (literally).
                </p>
                <p>
                  Everything is print on demand: your order goes straight into production, so there are
                  no minimums and no pressure to move bulk inventory. You get what you want, when you want it.
                </p>
                <p>
                  We design with attitude — bold type, unapologetic visuals, and pieces that feel like
                  they belong on the street, at a show, or anywhere but boring.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden border tt-border-light sm:aspect-[3/4] lg:min-h-[420px]">
              <Image
                src={sideImage}
                alt="Neon-lit urban alley and city atmosphere"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        <section className="border-b tt-border-light bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_14%,var(--tt-bg-light))] px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1600px]">
            <h2 className="text-center text-3xl font-bold tracking-[0.18em] tt-text-on-light uppercase sm:text-4xl">
              OUR VALUES
            </h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {values.map((item) => (
                <li
                  key={item.title}
                  className="border tt-border-light bg-background px-6 py-8 sm:px-8 sm:py-10"
                >
                  <h3 className="text-lg font-bold tracking-[0.12em] tt-text-on-light uppercase">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[14px] leading-relaxed tracking-[0.04em] tt-text-on-light sm:text-[15px]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 text-center">
            <h2 className="text-3xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-4xl">
              READY TO SHOP?
            </h2>
            <Link
              href="/shop"
              className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center tt-bg-dark px-10 text-[11px] font-bold tracking-[0.22em] tt-text-primary uppercase transition-opacity hover:opacity-90"
            >
              Shop now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
