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

export async function fetchPrintifyProducts(): Promise<PrintifyProduct[]> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/products.json?limit=24`;
  console.log('API KEY PREFIX:', process.env.PRINTIFY_API_KEY?.slice(0, 20));
  console.log('Printify fetch URL:', url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Printify list products failed: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as PrintifyListResponse;
  if (!Array.isArray(body.data)) {
    throw new Error("Printify list products: missing or invalid data array");
  }

  if (process.env.NODE_ENV === "development") {
    const productWithVariants = body.data.find(
      (p) => Array.isArray(p.variants) && p.variants.length > 0,
    );
    const firstVariant = productWithVariants?.variants?.[0];
    if (firstVariant != null) {
      console.log("[Printify] first variant row (sample keys):", JSON.stringify(firstVariant, null, 2));
    }
  }

  return body.data;
}

export async function fetchPrintifyProductById(id: string): Promise<PrintifyProduct | null> {
  const { shopId, apiKey } = requirePrintifyConfig();
  const url = `${PRINTIFY_API_BASE}/shops/${shopId}/products/${encodeURIComponent(id)}.json`;
  console.log('API KEY PREFIX:', process.env.PRINTIFY_API_KEY?.slice(0, 20));
  console.log('Printify fetch URL:', url);
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
