import { NextResponse } from "next/server";

import { quoteShippingEur, ShippingUnavailableError, type ShippingLine } from "@/lib/shipping";

/** Max lines and units per line — same bounds checkout accepts. */
const MAX_LINES = 50;
const MAX_LINE_QUANTITY = 50;

/**
 * Shipping cost for the cart and destination, shown at checkout before the
 * customer pays. create-payment-intent recomputes it independently, so this
 * is only for display.
 */
export async function POST(request: Request) {
  let body: { country?: unknown; items?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const country = typeof body.country === "string" ? body.country : "";
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (!country.trim() || rawItems.length === 0 || rawItems.length > MAX_LINES) {
    return NextResponse.json({ error: "Country and items are required." }, { status: 400 });
  }

  const lines: ShippingLine[] = [];
  for (const raw of rawItems as Record<string, unknown>[]) {
    const quantity = raw?.quantity;
    if (
      typeof raw?.productId !== "string" ||
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_LINE_QUANTITY
    ) {
      return NextResponse.json({ error: "Invalid line item." }, { status: 400 });
    }
    const variant = raw.printifyVariantId;
    lines.push({
      productId: raw.productId,
      quantity,
      printifyVariantId: typeof variant === "string" || typeof variant === "number" ? variant : null,
      productName: typeof raw.productName === "string" ? raw.productName.slice(0, 200) : undefined,
    });
  }

  try {
    const shipping = await quoteShippingEur(lines, country);
    return NextResponse.json({ shipping });
  } catch (e) {
    if (e instanceof ShippingUnavailableError) {
      return NextResponse.json(
        { error: `Sorry, these items can't be shipped to ${country.trim()}: ${e.items.join(", ")}.` },
        { status: 400 },
      );
    }
    console.error("[shipping-quote]", e);
    return NextResponse.json({ error: "Couldn't calculate shipping. Try again." }, { status: 500 });
  }
}
