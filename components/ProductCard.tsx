import Image from "next/image";

import type { Product } from "./product-data";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col border tt-border-light bg-background transition-colors hover:border-[color:var(--tt-accent-secondary)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_35%,var(--tt-bg-light))]">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:color-mix(in_srgb,var(--tt-text-on-light)_10%,transparent)] via-transparent to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 border-t border-[color:var(--tt-accent-secondary)] bg-background/95 px-4 py-2.5 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button type="button" className="text-[11px] font-semibold tracking-[0.28em] tt-text-secondary uppercase">
            Quick add
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t tt-border-light p-4 sm:p-5">
        <h2 className="text-base font-bold tracking-wide tt-text-on-light uppercase sm:text-lg">{product.name}</h2>
        <p className="text-sm tt-text-on-light">{product.price}</p>
      </div>
    </article>
  );
}
