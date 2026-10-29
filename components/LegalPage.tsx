import type { ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LEGAL_LAST_UPDATED } from "@/lib/site";

/** Shared layout for the privacy, terms and shipping & returns pages. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-[0.14em] tt-text-on-light uppercase sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-[12px] tracking-[0.08em] tt-text-on-light opacity-70">
              Last updated: {LEGAL_LAST_UPDATED}
            </p>
          </div>
        </section>
        <section className="px-4 py-12 sm:px-6 sm:py-16">
          <div className="legal-prose mx-auto flex max-w-3xl flex-col gap-4 text-[15px] leading-relaxed tracking-[0.02em] tt-text-on-light">
            {children}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** Section heading inside a legal page. */
export function LegalHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-6 text-lg font-bold tracking-[0.12em] uppercase first:mt-0">{children}</h2>
  );
}

/** Bulleted list with visible markers (Tailwind's preflight removes them). */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="ml-5 flex list-disc flex-col gap-2">{children}</ul>;
}

/** "deeptribe OÜ (registry code …), Address, Country" — whatever parts are filled in. */
export function sellerIdentity(entity: {
  name: string;
  registryCode?: string;
  address: string;
  country: string;
}) {
  const parts = [entity.address, entity.country].filter(Boolean).join(", ");
  let who = entity.name || "trashtribe";
  if (entity.name && entity.registryCode) who += ` (registry code ${entity.registryCode})`;
  return parts ? `${who}, ${parts}` : who;
}
