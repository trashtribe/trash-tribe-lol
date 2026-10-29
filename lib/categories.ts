import type { StoreCategory } from "@/lib/products";

/**
 * Categories temporarily pulled from the store. Their products disappear from
 * the shop, nav, search, sitemap and product pages (404), checkout rejects
 * them, and the wishlist page drops them like any missing product.
 *
 * To bring one back: remove it from this list and push.
 *
 * Kept out of lib/products.ts so client components (header, filters) can
 * import it without pulling in the Printify fetching code.
 */
export const HIDDEN_CATEGORIES: readonly StoreCategory[] = ["UNDERWEAR"];

export function isCategoryHidden(category: string): boolean {
  return (HIDDEN_CATEGORIES as readonly string[]).includes(category);
}
