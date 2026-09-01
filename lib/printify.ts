export type PrintifyImage = {
  id?: number;
  src: string;
  variant_ids?: number[];
  position?: string;
  is_default?: boolean;
};

/**
 * Canonical variant shape expected after normalizing Printify catalog responses.
 */
export type PrintifyVariant = {
  id: number;
  /** e.g. "S / Black", "M / White" */
  title: string;
  /** Option values ordered as returned by Printify (or derived from titles). */
  options: (string | number)[];
  is_available: boolean;
  /** Minor currency unit e.g. cents for EUR listings. */
  price: number;
};

/** Loose row from Printify REST (fields may omit or use legacy shapes). */
export type PrintifyVariantRow = Omit<Partial<PrintifyVariant>, "id" | "options"> & {
  id?: number | string;
  title?: string;
  price?: number;
  sku?: string;
  /** API may send an object map instead of an array. */
  options?: unknown;
  /** READ-ONLY in catalog: stock / fulfillment availability. */
  is_available?: boolean;
  /** Publishing: merchant enabled this SKU on the product. */
  is_enabled?: boolean;
  /** Alternate spelling seen in some payloads / proxies. */
  enabled?: boolean;
};

/**
 * Printify variants expose `is_enabled` (published/offered) and `is_available` (in stock).
 * Every boolean flag present must be true to surface the SKU on the storefront.
 * If none are sent (seeds, mocks), treat as sellable.
 */
export function variantRowIsSellable(row: PrintifyVariantRow): boolean {
  const gates: boolean[] = [];
  if (typeof row.is_enabled === "boolean") gates.push(row.is_enabled);
  if (typeof row.enabled === "boolean") gates.push(row.enabled);
  if (typeof row.is_available === "boolean") gates.push(row.is_available);
  if (gates.length === 0) return true;
  return gates.every(Boolean);
}

export type PrintifyProduct = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  images?: PrintifyImage[];
  variants?: PrintifyVariantRow[];
  visible?: boolean;
};

type PrintifyListResponse = {
  data?: PrintifyProduct[];
};

function requirePrintifyConfig(): { shopId: string; apiKey: string } {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_KEY;
  if (!shopId?.trim() || !apiKey?.trim()) {
    throw new Error("PRINTIFY_SHOP_ID and PRINTIFY_API_KEY must be set");
  }
  return { shopId: shopId.trim(), apiKey: apiKey.trim() };
}

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

/** Tag used to invalidate the product list on demand — see /api/printify-webhook. */
export const PRINTIFY_PRODUCTS_TAG = "printify-products";

export async function fetchPrintifyProducts(): Promise<PrintifyProduct[]> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/products.json?limit=24`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    // Falls back to this time-based refresh even if the webhook below never
    // fires (e.g. not yet registered, or Printify retries exhausted).
    next: { revalidate: 300, tags: [PRINTIFY_PRODUCTS_TAG] },
  });

  if (!res.ok) {
    throw new Error(`Printify list products failed: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as PrintifyListResponse;
  if (!Array.isArray(body.data)) {
    throw new Error("Printify list products: missing or invalid data array");
  }

  return body.data;
}

export type PrintifyShipment = {
  carrier?: string;
  number?: string;
  url?: string;
  delivered_at?: string;
};

export type PrintifyOrder = {
  id: string;
  status?: string;
  shipments?: PrintifyShipment[];
};

/** Live fulfillment/tracking status for an order already pushed to Printify. */
export async function fetchPrintifyOrderById(printifyOrderId: string): Promise<PrintifyOrder | null> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/orders/${encodeURIComponent(printifyOrderId)}.json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Printify get order failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as PrintifyOrder;
}

export async function fetchPrintifyProductById(id: string): Promise<PrintifyProduct | null> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/products/${encodeURIComponent(id)}.json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Printify get product failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as PrintifyProduct;
}

/**
 * Printify's product update endpoint accepts a partial document — per their
 * docs: "A product can be updated partially or as a whole document. When
 * updating variants, all variants must be present in the request." Sending
 * only `tags` here (never touching `variants`, `print_areas`, etc.) is what
 * keeps this safe to call from the admin hide/show toggle without any risk
 * of wiping out the rest of the product.
 */
export async function updatePrintifyProductTags(id: string, tags: string[]): Promise<void> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/products/${encodeURIComponent(id)}.json`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tags }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Printify update product tags failed: ${res.status} ${res.statusText}`);
  }
}
