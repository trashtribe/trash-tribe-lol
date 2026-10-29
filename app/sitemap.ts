import type { MetadataRoute } from "next";

import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

function absoluteUrl(src: string) {
  return src.startsWith("/") ? `${SITE_URL}${src}` : src;
}

// Only public, indexable pages. Account, checkout, wishlist and the like are
// noindex and stay out of here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/shipping-returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/shop/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: [absoluteUrl(product.imageSrc)],
  }));

  return [...staticPages, ...productPages];
}
