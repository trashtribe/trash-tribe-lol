import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { ProductScroller } from "@/components/ProductScroller";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: {
    absolute: "trashtribe | Independent Merch",
  },
  description:
    "Independent print-on-demand posters, tees, hats, and accessories. Shop bold wall art and streetwear from trashtribe.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <MarqueeBanner
          content="20% OFF EVERYTHING ★ WE'RE LIVE ★"
          bgClassName="tt-bg-dark"
          textClassName="tt-text-primary"
          direction="left"
        />
        <Hero />
        <MarqueeBanner
          content="SHOP NOW ★ SHOP NOW ★ SHOP NOW ★"
          bgClassName="tt-bg-secondary"
          textClassName="tt-text-on-light"
          direction="right"
        />
        <ProductScroller products={products} />
      </main>
      <Footer />
    </>
  );
}
