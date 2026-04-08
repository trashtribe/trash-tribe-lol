import Link from "next/link";

import type { Product } from "./product-data";
import { ShopProductCard } from "./ShopProductCard";

type ProductGridProps = {
  id?: string;
  title: string;
  viewAllHref?: string;
  products: Product[];
  ariaLabelledBy: string;
};

export function ProductGrid({ id, title, viewAllHref = "#shop", products, ariaLabelledBy }: ProductGridProps) {
  return (
    <section id={id} className="border-b tt-border-light bg-background px-4 py-12 sm:px-6 sm:py-16" aria-labelledby={ariaLabelledBy}>
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 text-center sm:mb-10">
          <h2 id={ariaLabelledBy} className="tt-gradient-text text-xl font-bold tracking-[0.2em] uppercase sm:text-2xl">{title}</h2>
          <Link href={viewAllHref} className="tt-gradient-text-link mt-4 inline-block text-[11px] font-bold tracking-[0.18em] uppercase underline-offset-4 transition-colors hover:tt-text-secondary">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-5">
          {products.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
