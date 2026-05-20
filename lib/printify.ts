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
  is_available?: boolean;
  is_enabled?: boolean;
};

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
    next: { revalidate: 60 },
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
