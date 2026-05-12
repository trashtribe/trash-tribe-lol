import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFilters, type ShopCategoryFilter } from "@/components/ShopFilters";
import { ShopProductCard } from "@/components/ShopProductCard";
import type { Product } from "@/components/product-data";
import { products } from "@/components/product-data";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse posters, apparel, and accessories from Trash Tribe. Independent print-on-demand merch with bold graphics.",
  alternates: { canonical: "/shop" },
};

function resolveActiveFilter(categoryParam: string | undefined): ShopCategoryFilter {
  const key = categoryParam?.toUpperCase();
  if (!key || key === "ALL") return "ALL";
  if (key === "POSTERS" || key === "APPAREL" || key === "ACCESSORIES") {
    return key;
  }
  return "ALL";
}

function filterProductsByCategory(
  list: Product[],
  active: ShopCategoryFilter,
): Product[] {
  if (active === "ALL") return list;
  return list.filter((p) => p.category === active);
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const activeFilter = resolveActiveFilter(categoryParam);
  const visibleProducts = filterProductsByCategory(products, activeFilter);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1600px]">
            <h1 className="text-center text-4xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-5xl">
              SHOP
            </h1>
            <ShopFilters activeFilter={activeFilter} />
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[1600px]">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((product) => (
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
