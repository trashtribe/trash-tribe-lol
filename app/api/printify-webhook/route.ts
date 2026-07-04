import crypto from "crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { PRINTIFY_PRODUCTS_TAG } from "@/lib/printify";

/**
 * Printify webhook receiver.
 *
 * Register this URL against your Printify shop so catalog changes (new
 * product published, product deleted, product updated) show up on the
 * storefront within seconds instead of waiting for the 5-minute fallback
 * cache to expire.
 *
 * Printify doesn't expose webhook management in its dashboard UI — you
 * register it via their API. Run this once (replace SHOP_ID and the two
 * tokens), from your own machine or Postman, not from this app:
 *
 *   curl -X POST "https://api.printify.com/v1/shops/SHOP_ID/webhooks.json" \
 *     -H "Authorization: Bearer $PRINTIFY_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{
 *       "topic": "product:publish:started",
 *       "url": "https://www.trashtribe.lol/api/printify-webhook"
 *     }'
 *
 * Repeat for topics: product:publish:succeeded, product:deleted,
 * product:updated. Each registration call returns a "secret" — copy it into
 * this deployment's PRINTIFY_WEBHOOK_SECRET env var (Printify uses the same
 * secret across all webhooks for a shop, so you only need to set it once).
 */

const RELEVANT_TOPICS = new Set([
  "product:publish:started",
  "product:publish:succeeded",
  "product:deleted",
  "product:updated",
]);

function isValidSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;

  // Printify sends the signature as "sha256=<hex>" or a bare hex digest
  // depending on API version — accept either.
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const a = Buffer.from(provided.trim(), "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.PRINTIFY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[printify webhook] PRINTIFY_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-pfy-signature") ?? request.headers.get("x-printify-signature");

  if (!isValidSignature(rawBody, signature, secret)) {
    console.error("[printify webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: { topic?: string; type?: string };
  try {
    payload = JSON.parse(rawBody) as { topic?: string; type?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const topic = payload.topic ?? payload.type ?? "";

  if (RELEVANT_TOPICS.has(topic)) {
    // { expire: 0 }: this is a webhook triggered by an external system, so
    // the data should expire immediately rather than use stale-while-
    // revalidate semantics (see Next.js revalidateTag docs).
    revalidateTag(PRINTIFY_PRODUCTS_TAG, { expire: 0 });
  }

  return NextResponse.json({ received: true, topic });
}
