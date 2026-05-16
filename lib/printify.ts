export type PrintifyImage = {
  id?: number;
  src: string;
  variant_ids?: number[];
  position?: string;
  is_default?: boolean;
};

export type PrintifyVariant = {
  id: number;
  title?: string;
  price: number;
  sku?: string;
  is_enabled?: boolean;
  is_available?: boolean;
  /** Present on some responses; otherwise parse from {@link PrintifyVariant.title}. */
  options?: Record<string, string | number | undefined>;
};

export type PrintifyProduct = {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  images?: PrintifyImage[];
  variants?: PrintifyVariant[];
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

  return body.data;
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
