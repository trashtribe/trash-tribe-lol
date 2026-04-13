import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { WelcomeSection } from "@/components/WelcomeSection";
import { products } from "@/components/product-data";

export const metadata: Metadata = {
  title: {
    absolute: "Trash Tribe | Independent Merch",
  },
  description:
    "Independent print-on-demand posters, tees, hats, and accessories. Shop bold wall art and streetwear from Trash Tribe.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <WelcomeSection />
        <ProductGrid
          id="shop"
          title="Shop"
          products={products}
          ariaLabelledBy="shop-heading"
        />
      </main>
      <Footer />
    </>
  );
}
