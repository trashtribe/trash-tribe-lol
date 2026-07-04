import { NextResponse } from "next/server";

import { getProducts } from "@/lib/products";

/**
 * Product list for the client-side search modal. Fetched on demand by
 * components/SearchModal.tsx instead of being threaded through the root
 * layout — see the "Diagnose + fix session loss + wishlist phantom item"
 * fix: awaiting getProducts() directly in app/layout.tsx forced the whole
 * app into dynamic rendering, which made Next re-fetch/re-render the root
 * layout (and remount AuthProvider/CartProvider/WishlistProvider) on every
 * navigation.
 */
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (e) {
    console.error("[api/products] getProducts failed:", e);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
