import { countryIso } from "@/lib/countries";
import { fetchPrintifyProducts, variantRowIsSellable } from "@/lib/printify";

/**
 * Shipping is charged at what Printify charges us, per country and per cart,
 * so no order loses money on delivery. Rates come from Printify's catalog
 * (cached for a day) and are in USD; they're converted with a slightly
 * conservative rate and rounded up to the next .99.
 */
const USD_TO_EUR = 0.9;

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

type ShippingProfile = {
  variant_ids: number[];
  first_item: { cost: number; currency: string };
  additional_items: { cost: number; currency: string };
  countries: string[];
};

type ShippingInfo = { profiles?: ShippingProfile[] };

export type ShippingLine = {
  productId: string;
  printifyVariantId?: number | string | null;
  quantity: number;
  productName?: string;
};

/** Some items can't be shipped to the chosen country (or Printify has no rate for them). */
export class ShippingUnavailableError extends Error {
  constructor(public readonly items: string[]) {
    super(`No shipping rate for: ${items.join(", ")}`);
  }
}

async function fetchShippingProfiles(
  blueprintId: number,
  printProviderId: number,
): Promise<ShippingProfile[]> {
  const apiKey = process.env.PRINTIFY_API_KEY?.trim();
  if (!apiKey) throw new Error("PRINTIFY_API_KEY must be set");
  const res = await fetch(
    `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/shipping.json`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 86400, tags: ["printify-shipping"] },
    },
  );
  if (!res.ok) return [];
  const body = (await res.json()) as ShippingInfo;
  return Array.isArray(body.profiles) ? body.profiles : [];
}

function profileFor(
  profiles: ShippingProfile[],
  variantId: number,
  iso: string,
): ShippingProfile | null {
  const forVariant = profiles.filter((p) => p.variant_ids.includes(variantId));
  return (
    forVariant.find((p) => p.countries.includes(iso)) ??
    forVariant.find((p) => p.countries.includes("REST_OF_THE_WORLD")) ??
    null
  );
}

/** USD cents → euros, rounded up to the next x.99 (e.g. 10.16 → 10.99). */
function toDisplayEur(usdCents: number): number {
  if (usdCents <= 0) return 0;
  const eur = (usdCents / 100) * USD_TO_EUR;
  return Math.floor(eur) + 0.99;
}

/**
 * Shipping in euros for a cart sent to `countryLabel`. Mirrors how Printify
 * bills: each print provider ships its own parcel, charging the first-item
 * rate once (the highest among that parcel's items) and the additional-item
 * rate for every other unit.
 */
export async function quoteShippingEur(
  lines: ShippingLine[],
  countryLabel: string,
): Promise<number> {
  const iso = countryIso(countryLabel);
  if (!iso) throw new ShippingUnavailableError([countryLabel]);

  const products = await fetchPrintifyProducts();
  const parcels = new Map<number, { first: number; additional: number; units: number }[]>();
  const unavailable: string[] = [];

  for (const line of lines) {
    const product = products.find((p) => String(p.id) === line.productId);
    const label = line.productName?.trim() || line.productId;
    if (!product?.blueprint_id || !product.print_provider_id) {
      unavailable.push(label);
      continue;
    }

    // No variant chosen: use the first sellable one.
    const rawVariantId =
      line.printifyVariantId != null && String(line.printifyVariantId).trim() !== ""
        ? line.printifyVariantId
        : product.variants?.find(variantRowIsSellable)?.id;
    const variantId = Number(rawVariantId);

    const profiles = await fetchShippingProfiles(product.blueprint_id, product.print_provider_id);
    const profile = Number.isInteger(variantId) ? profileFor(profiles, variantId, iso) : null;
    if (!profile) {
      unavailable.push(label);
      continue;
    }

    const parcel = parcels.get(product.print_provider_id) ?? [];
    parcel.push({
      first: profile.first_item.cost,
      additional: profile.additional_items.cost,
      units: line.quantity,
    });
    parcels.set(product.print_provider_id, parcel);
  }

  if (unavailable.length > 0) throw new ShippingUnavailableError(unavailable);

  let usdCents = 0;
  for (const items of parcels.values()) {
    const lead = items.reduce((a, b) => (b.first > a.first ? b : a));
    usdCents += lead.first;
    for (const item of items) {
      const extraUnits = item === lead ? item.units - 1 : item.units;
      usdCents += extraUnits * item.additional;
    }
  }

  return toDisplayEur(usdCents);
}
