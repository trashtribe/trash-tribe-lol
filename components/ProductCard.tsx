import Image from "next/image";

import type { Product } from "./product-data";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col border border-[#111111]/12 bg-background transition-colors hover:border-[color:color-mix(in_srgb,var(--tt-accent)_55%,transparent)]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111111]/10 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-x-0 bottom-0 border-t border-[color:color-mix(in_srgb,var(--tt-accent)_35%,transparent)] bg-background/95 px-4 py-2.5 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            className="text-[11px] font-semibold tracking-[0.28em] text-[color:var(--tt-accent)] uppercase"
          >
            Quick add
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-[#111111]/10 p-4 sm:p-5">
        <h2 className="text-base font-bold tracking-wide text-[#111111] uppercase sm:text-lg">
          {product.name}
        </h2>
        <p className="text-sm text-[#111111]">{product.price}</p>
      </div>
    </article>
  );
}
