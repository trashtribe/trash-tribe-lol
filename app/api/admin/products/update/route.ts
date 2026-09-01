import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PRINTIFY_PRODUCTS_TAG, updatePrintifyProductDetails } from "@/lib/printify";

export async function POST(request: Request) {
  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");

  if (!productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  if (!title) {
    const url = new URL(`/admin/products/${encodeURIComponent(productId)}`, request.url);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  // Title/description only — see updatePrintifyProductDetails(), never
  // touches `variants` so there's no risk to pricing/sizes/designs.
  await updatePrintifyProductDetails(productId, { title, description });

  revalidateTag(PRINTIFY_PRODUCTS_TAG, { expire: 0 });

  return NextResponse.redirect(new URL("/admin/products", request.url), { status: 303 });
}
