import { ProductCard } from "./ProductCard";
import type { Product } from "./product-data";

type ProductSectionProps = {
  id?: string;
  title: string;
  products: Product[];
  ariaLabelledBy: string;
};

export function ProductSection({
  id,
  title,
  products,
  ariaLabelledBy,
}: ProductSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-[#111111]/10 bg-background px-4 py-16 first:pt-20 sm:px-6 sm:py-24 sm:first:pt-28 md:scroll-mt-28"
      aria-labelledby={ariaLabelledBy}
    >
      <div className="mx-auto max-w-[1600px]">
        <h2
          id={ariaLabelledBy}
          className="tt-gradient-text mb-12 font-bold text-2xl tracking-tight uppercase sm:text-3xl md:mb-14"
        >
          {title}
        </h2>
        <ul className="grid grid-cols-1 gap-px bg-[#111111]/10 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="bg-background">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
