import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductDetailView } from "@/components/ProductDetailView";
import { DISPLAY_CURRENCY, getProductBySlug, getProducts, type StoreProduct } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

function truncateDescription(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Some Printify products have no description; fall back to a generic line so
 * the meta description and structured data are never empty. */
function productDescription(product: StoreProduct) {
  return (
    product.description.trim() ||
    `${product.name} by trashtribe. Independent print-on-demand merch with bold graphics.`
  );
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product" };
  }

  const description = truncateDescription(productDescription(product));
  const path = `/shop/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${product.name} | trashtribe`,
      description,
      url: path,
      images: [{ url: product.imageSrc, alt: product.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | trashtribe`,
      description,
      images: [product.imageSrc],
    },
  };
}

/** schema.org Product data so Google can show price and stock in results. */
function productJsonLd(product: StoreProduct) {
  const absolute = (src: string) => (src.startsWith("/") ? `${SITE_URL}${src}` : src);
  const prices = product.variants.map((v) => v.price);
  const inStock = product.variants.some((v) => v.isAvailable);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    image: (product.galleryImages.length ? product.galleryImages : [product.imageSrc]).map(absolute),
    sku: product.id,
    brand: { "@type": "Brand", name: "trashtribe" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: DISPLAY_CURRENCY,
      // Variant prices are in minor units (cents).
      lowPrice: (Math.min(...prices) / 100).toFixed(2),
      highPrice: (Math.max(...prices) / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/shop/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const catalog = await getProducts();
  const relatedProducts = catalog
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
      {product.variants.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Header />
      <ProductDetailView key={product.id} product={product} relatedProducts={relatedProducts} />
      <Footer />
    </>
  );
}
