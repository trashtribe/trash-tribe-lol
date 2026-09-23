/**
 * Prodigi Print API (v4.0) client — a second POD provider running in
 * parallel with Printify (see lib/printify.ts), for products Prodigi covers
 * that Printify doesn't (e.g. no EU/UK manufacturer for that blueprint).
 *
 * Unlike Printify, Prodigi doesn't host a "shop" catalog with your product
 * listings/photos — you own the catalog (see lib/prodigi-products.ts) and
 * just call Prodigi per-order with a SKU + print-ready asset URL + shipping
 * address. Reference: https://www.prodigi.com/print-api/docs/reference/
 *
 * Almost every Prodigi response is HTTP 200 even for "soft" failures — you
 * must branch on the `outcome` string, not just `res.ok`. See
 * ProdigiOutcome below and each function's doc comment for what outcomes
 * it can return.
 */

function requireProdigiConfig(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.PRODIGI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("PRODIGI_API_KEY must be set");
  }
  // Sandbox never charges or fulfills — use it until real orders are wanted.
  // Same key format for both; only the host differs.
  const env = process.env.PRODIGI_ENVIRONMENT?.trim().toLowerCase();
  const baseUrl =
    env === "live" || env === "production"
      ? "https://api.prodigi.com/v4.0"
      : "https://api.sandbox.prodigi.com/v4.0";
  return { apiKey, baseUrl };
}

async function prodigiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: unknown }> {
  const { apiKey, baseUrl } = requireProdigiConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let parsed: unknown = undefined;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    // Non-JSON body (rare — usually a gateway-level error page). Fall through
    // with parsed = undefined so callers still see status + raw text.
  }
  if (!res.ok) {
    return { ok: false, status: res.status, error: parsed ?? text };
  }
  return { ok: true, data: parsed as T };
}

// ---------------------------------------------------------------------------
// Product Details — GET /v4.0/products/{sku}
// ---------------------------------------------------------------------------

export type ProdigiProductDetails = {
  sku: string;
  description: string;
  productDimensions?: { width: number; height: number; units: string };
  /** e.g. { wrap: ["Black", "ImageWrap", "White"] } — possible values per attribute. */
  attributes: Record<string, string[]>;
  printAreas: Record<string, { required: boolean }>;
  variants: Array<{
    /** Specific attribute values for this variant, e.g. { wrap: "Black" }. */
    attributes: Record<string, string>;
    /** ISO 3166-1 alpha-2 countries this variant can ship to. */
    shipsTo: string[];
    /** Required print-file resolution per print area, in pixels. */
    printAreaSizes: Record<string, { horizontalResolution: number; verticalResolution: number }>;
  }>;
};

/** Looks up a SKU's attributes, print-area asset requirements, and shippable countries. No pricing here — see fetchProdigiQuote. */
export async function fetchProdigiProduct(sku: string): Promise<ProdigiProductDetails | null> {
  const result = await prodigiFetch<{ outcome: string; product: ProdigiProductDetails }>(
    `/products/${encodeURIComponent(sku)}`,
  );
  if (!result.ok) {
    console.error("[prodigi] fetchProdigiProduct failed:", sku, result.status, result.error);
    return null;
  }
  return result.data.product;
}

// ---------------------------------------------------------------------------
// Quote — POST /v4.0/quotes
// ---------------------------------------------------------------------------

export type ProdigiShippingMethod = "budget" | "standard" | "standardplus" | "express" | "overnight";

export type ProdigiQuoteRequest = {
  shippingMethod?: ProdigiShippingMethod;
  destinationCountryCode: string;
  currencyCode?: string;
  items: Array<{
    sku: string;
    copies: number;
    attributes?: Record<string, string>;
  }>;
};

export type ProdigiQuote = {
  shipmentMethod: string;
  costSummary: {
    items: { amount: string; currency: string };
    shipping: { amount: string; currency: string };
  };
  items: Array<{
    id: string;
    sku: string;
    copies: number;
    unitCost: { amount: string; currency: string };
    attributes: Record<string, string>;
  }>;
};

/** Price + shipping estimate before creating a real order. `outcome` can be "Created" or "CreatedWithIssues". */
export async function fetchProdigiQuote(
  req: ProdigiQuoteRequest,
): Promise<ProdigiQuote[] | null> {
  const body = {
    shippingMethod: req.shippingMethod,
    destinationCountryCode: req.destinationCountryCode,
    currencyCode: req.currencyCode,
    items: req.items.map((item) => ({
      sku: item.sku,
      copies: item.copies,
      attributes: item.attributes ?? {},
      // Quote assets only need printArea, no URL — we're not printing yet.
      assets: [{ printArea: "default" }],
    })),
  };
  const result = await prodigiFetch<{ outcome: string; quotes: ProdigiQuote[] }>("/quotes", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!result.ok) {
    console.error("[prodigi] fetchProdigiQuote failed:", result.status, result.error);
    return null;
  }
  return result.data.quotes;
}

// ---------------------------------------------------------------------------
// Create Order — POST /v4.0/orders
// ---------------------------------------------------------------------------

export type ProdigiRecipient = {
  name: string;
  email?: string;
  phoneNumber?: string;
  address: {
    line1: string;
    line2?: string;
    postalOrZipCode: string;
    /** ISO 3166-1 alpha-2 */
    countryCode: string;
    townOrCity: string;
    stateOrCounty?: string | null;
  };
};

export type ProdigiOrderItem = {
  merchantReference?: string;
  sku: string;
  copies: number;
  sizing?: "fillPrintArea" | "fitPrintArea" | "stretchToPrintArea";
  attributes?: Record<string, string>;
  assets: Array<{
    printArea: string;
    /** Must be a publicly reachable URL — Prodigi downloads it server-side. */
    url: string;
  }>;
};

export type CreateProdigiOrderInput = {
  /** Our own order id — round-trips back on the order and on callbacks. */
  merchantReference: string;
  /** Doubles as a dedupe guard: resubmitting the same key returns the existing order (outcome "AlreadyExists") instead of creating a new one — matches the redelivered-webhook guard used for Printify. */
  idempotencyKey: string;
  shippingMethod: "Budget" | "Standard" | "StandardPlus" | "Express" | "Overnight";
  recipient: ProdigiRecipient;
  items: ProdigiOrderItem[];
};

export type CreateProdigiOrderResult =
  | { outcome: "Created" | "CreatedWithIssues" | "AlreadyExists"; orderId: string; raw: unknown }
  | { outcome: "OnHold"; orderId: string; raw: unknown }
  | { outcome: "Error"; status: number; error: unknown };

/**
 * Submits a real print order. Every branch below is a *successful* HTTP
 * response (200) — Prodigi encodes the actual result in `outcome`, not the
 * status code. `OnHold` means the account's pause-window setting held it
 * back; only the order id is returned in that case, so treat it the same
 * as success for our purposes (it will fulfill once the window passes).
 */
export async function createProdigiOrder(
  input: CreateProdigiOrderInput,
): Promise<CreateProdigiOrderResult> {
  const body = {
    merchantReference: input.merchantReference,
    idempotencyKey: input.idempotencyKey,
    shippingMethod: input.shippingMethod,
    recipient: input.recipient,
    items: input.items.map((item) => ({
      merchantReference: item.merchantReference,
      sku: item.sku,
      copies: item.copies,
      sizing: item.sizing ?? "fillPrintArea",
      attributes: item.attributes ?? {},
      assets: item.assets,
    })),
  };

  const result = await prodigiFetch<{ outcome: string; order?: { id: string } }>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return { outcome: "Error", status: result.status, error: result.error };
  }

  const outcome = result.data.outcome;
  const orderId = result.data.order?.id;

  if (!orderId) {
    // Shouldn't happen for a 200 response per the docs, but don't pretend
    // we have an order id if Prodigi didn't actually send one.
    return { outcome: "Error", status: 200, error: result.data };
  }

  if (outcome === "OnHold") {
    return { outcome: "OnHold", orderId, raw: result.data };
  }
  return {
    outcome: outcome as "Created" | "CreatedWithIssues" | "AlreadyExists",
    orderId,
    raw: result.data,
  };
}

/** Maps this site's "standard" | "express" checkout choice to a Prodigi shipping method. Same simplification lib/printify-order-fulfillment.ts makes for Printify's numeric codes. */
export function shippingMethodToProdigi(
  method: string | null,
): CreateProdigiOrderInput["shippingMethod"] {
  return method === "express" ? "Express" : "Standard";
}
