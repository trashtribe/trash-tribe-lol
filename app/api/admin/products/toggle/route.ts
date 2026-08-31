import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { fetchPrintifyProductById, PRINTIFY_PRODUCTS_TAG, updatePrintifyProductTags } from "@/lib/printify";
import { HIDE_TAG } from "@/lib/products";

export async function POST(request: Request) {
  let body: { productId?: string; hide?: boolean };
  try {
    body = (await request.json()) as { productId?: string; hide?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { productId, hide } = body;
  if (!productId || typeof hide !== "boolean") {
    return NextResponse.json({ error: "productId and hide are required." }, { status: 400 });
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
  const withoutHideTag = currentTags.filter((t) => t.trim().toLowerCase() !== HIDE_TAG);
  const nextTags = hide ? [...withoutHideTag, HIDE_TAG] : withoutHideTag;

  await updatePrintifyProductTags(productId, nextTags);

  // Instant refresh on trashtribe.lol instead of waiting on the 5-minute
  // fallback cache — same tag the printify-webhook route invalidates.
  revalidateTag(PRINTIFY_PRODUCTS_TAG, { expire: 0 });

  return NextResponse.json({ ok: true, hidden: hide });
}
