import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopProductCard } from "@/components/ShopProductCard";
import { products } from "@/components/product-data";

const filters = ["ALL", "POSTERS", "APPAREL", "ACCESSORIES"] as const;
const activeFilter = "ALL";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse posters, apparel, and accessories from Trash Tribe. Independent print-on-demand merch with bold graphics.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1600px]">
            <h1 className="text-center text-4xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-5xl">
              SHOP
            </h1>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {filters.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`border px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors sm:px-5 sm:py-2.5 ${
                      isActive
                        ? "tt-bg-primary tt-text-on-light tt-border-light"
                        : "bg-background tt-text-on-light tt-border-light hover:tt-text-secondary"
                    }`}
                    aria-pressed={isActive}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[1600px]">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
