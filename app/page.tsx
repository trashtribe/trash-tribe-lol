import { ComingSoonSplash } from "@/components/ComingSoonSplash";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { WelcomeSection } from "@/components/WelcomeSection";
import { products } from "@/components/product-data";

export default function Home() {
  if (process.env.NODE_ENV === "production") {
    return <ComingSoonSplash />;
  }

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
