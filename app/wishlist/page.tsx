import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WishlistGrid } from "@/components/WishlistGrid";

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1600px]">
            <h1 className="text-center text-4xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-5xl">
              WISHLIST
            </h1>
          </div>
        </section>
        <WishlistGrid
          emptyAction={
            <Link
              href="/shop"
              className="inline-block tt-bg-primary px-10 py-4 text-[11px] font-bold tracking-[0.2em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary"
            >
              SHOP NOW
            </Link>
          }
        />
      </main>
      <Footer />
    </>
  );
}
