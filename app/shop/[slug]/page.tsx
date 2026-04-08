import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductDetailView } from "@/components/ProductDetailView";
import { products } from "@/components/product-data";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      if (a.category === product.category && b.category !== product.category) {
        return -1;
      }
      if (a.category !== product.category && b.category === product.category) {
        return 1;
      }
      return 0;
    })
    .slice(0, 4);

  return (
    <>
      <Header />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  );
}
