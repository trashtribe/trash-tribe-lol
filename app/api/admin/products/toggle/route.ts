import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { fetchPrintifyProductById, PRINTIFY_PRODUCTS_TAG, updatePrintifyProductTags } from "@/lib/printify";
import { HIDE_TAG } from "@/lib/products";

// Printify doesn't expose a Tags field in its UI for API-connected shops
// like this one (confirmed by the user), so this admin panel is the only
// place this tag can be set.
const TOGGLEABLE_TAGS = new Set<string>([HIDE_TAG]);

export async function POST(request: Request) {
  let body: { productId?: string; tag?: string; on?: boolean };
  try {
    body = (await request.json()) as { productId?: string; tag?: string; on?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { productId, tag, on } = body;
  if (!productId || typeof on !== "boolean" || !tag || !TOGGLEABLE_TAGS.has(tag)) {
    return NextResponse.json(
      { error: "productId, a valid tag, and on are required." },
      { status: 400 },
    );
  }

  const product = await fetchPrintifyProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // Only ever touch `tags` — Printify's product update endpoint supports
  // partial updates, but explicitly warns that sending `variants` requires
  // ALL variants to be present, so this deliberately never sends that field
  // (or anything else) to avoid any risk of wiping design/variant data.
  const currentTags = product.tags ?? [];
  const withoutTag = currentTags.filter((t) => t.trim().toLowerCase() !== tag);
  const nextTags = on ? [...withoutTag, tag] : withoutTag;

  await updatePrintifyProductTags(productId, nextTags);

  // Instant refresh on trashtribe.lol instead of waiting on the 5-minute
  // fallback cache — same tag the printify-webhook route invalidates.
  revalidateTag(PRINTIFY_PRODUCTS_TAG, { expire: 0 });

  return NextResponse.json({ ok: true, tag, on });
}
