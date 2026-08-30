import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ShopFilters, type ShopCategoryFilter } from "@/components/ShopFilters";
import { ShopProductCard } from "@/components/ShopProductCard";
import type { StoreProduct } from "@/lib/products";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse t-shirts, underwear, accessories, and posters from trashtribe. Independent print-on-demand merch with bold graphics.",
  alternates: { canonical: "/shop" },
};

const VALID_CATEGORIES = ["TOPS", "UNDERWEAR", "ACCESSORIES", "POSTERS"] as const;
const VALID_SUBCATEGORIES = [
  "TSHIRT",
  "CROP",
  "TANKS",
  "PANTIES",
  "SOCKS",
  "BAGS",
  "KEYCHAINS",
] as const;

function resolveActiveFilter(categoryParam: string | undefined): ShopCategoryFilter {
  const key = categoryParam?.toUpperCase();
  if (!key || key === "ALL") return "ALL";
  if ((VALID_CATEGORIES as readonly string[]).includes(key)) {
    return key as ShopCategoryFilter;
  }
  return "ALL";
}

function resolveActiveSubcategory(subcategoryParam: string | undefined): string | null {
  const key = subcategoryParam?.toUpperCase();
  if (!key) return null;
  return (VALID_SUBCATEGORIES as readonly string[]).includes(key) ? key : null;
}

function filterProducts(
  list: StoreProduct[],
  activeCategory: ShopCategoryFilter,
  activeSubcategory: string | null,
): StoreProduct[] {
  let filtered = list;
  if (activeCategory !== "ALL") {
    filtered = filtered.filter((p) => p.category === activeCategory);
  }
  if (activeSubcategory) {
    filtered = filtered.filter((p) => p.subcategory === activeSubcategory);
  }
  return filtered;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string }>;
}) {
  const { category: categoryParam, subcategory: subcategoryParam } = await searchParams;
  const activeFilter = resolveActiveFilter(categoryParam);
  const activeSubcategory = resolveActiveSubcategory(subcategoryParam);
  const products = await getProducts();
  const visibleProducts = filterProducts(products, activeFilter, activeSubcategory);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col bg-background">
        <section className="border-b tt-border-light px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-[1600px]">
            <h1 className="text-center text-4xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-5xl">
              SHOP
            </h1>
            <ShopFilters activeFilter={activeFilter} activeSubcategory={activeSubcategory} />
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
