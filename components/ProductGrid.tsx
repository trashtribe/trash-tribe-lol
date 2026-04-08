import Image from "next/image";
import Link from "next/link";

import type { Product } from "./product-data";

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <div className="relative h-32 overflow-hidden border tt-border-light bg-background p-3 sm:h-36 md:h-40">
        <div className="relative h-full w-full">
          <Image src={product.imageSrc} alt={product.imageAlt} fill className="object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        </div>
        <button type="button" className="absolute right-2 top-2 border tt-border-light bg-background p-1.5 tt-text-on-light transition-colors hover:tt-text-secondary" aria-label={`Save ${product.name} to wishlist`}>
          <HeartIcon />
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full tt-bg-primary px-2 py-2 text-center text-[9px] font-bold tracking-[0.18em] tt-text-on-light uppercase transition-transform duration-200 group-hover:translate-y-0">
          Quick buy
        </div>
      </div>
      <div className="mt-2.5 flex flex-col gap-1">
        <h3 className="text-[11px] font-bold tracking-[0.06em] tt-text-on-light uppercase leading-snug sm:text-[12px]">{product.name}</h3>
        <p className="text-[11px] font-bold tracking-[0.05em] tt-text-on-light sm:text-[12px]">{product.price}</p>
      </div>
    </article>
  );
}

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
