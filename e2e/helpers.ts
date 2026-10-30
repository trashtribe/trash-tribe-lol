import type { APIRequestContext, Page } from "@playwright/test";

export type CatalogVariant = { id: number; title: string; isAvailable: boolean; price: number };
export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  variants: CatalogVariant[];
};

export async function getCatalog(request: APIRequestContext): Promise<CatalogProduct[]> {
  const res = await request.get("/api/products");
  if (!res.ok()) throw new Error(`/api/products returned ${res.status()}`);
  const { products } = (await res.json()) as { products: CatalogProduct[] };
  return products;
}

/** First product with at least one in-stock variant, plus that variant. */
export async function getBuyableProduct(request: APIRequestContext) {
  const catalog = await getCatalog(request);
  for (const product of catalog) {
    const variant = product.variants.find((v) => v.isAvailable);
    if (variant) return { product, variant };
  }
  throw new Error("No product with an available variant in the catalog.");
}

/** Keeps the "Create an account" popup from covering the page mid-test. */
export async function dismissSignupPopup(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("tt-signup-popup-dismissed", "1");
  });
}

export const validShipping = {
  guestEmail: "e2e@example.com",
  shippingName: "E2E Test",
  shippingAddress1: "Test street 1",
  shippingCity: "Tallinn",
  shippingPostalCode: "10111",
  shippingCountry: "Estonia",
  shippingPhone: "+3720000000",
};
