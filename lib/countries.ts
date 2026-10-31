/**
 * Countries the checkout ships to, as shown to customers, with their ISO
 * 3166-1 alpha-2 codes (what Printify's orders and shipping rates use).
 * Keep DESTINATIONS in app/shipping-returns/page.tsx in sync.
 */
export const SHIPPING_COUNTRIES = {
  Ireland: "IE",
  "United Kingdom": "GB",
  France: "FR",
  Germany: "DE",
  Spain: "ES",
  Italy: "IT",
  Netherlands: "NL",
  Belgium: "BE",
  Portugal: "PT",
  Austria: "AT",
  Sweden: "SE",
  Denmark: "DK",
  Finland: "FI",
  Poland: "PL",
  "United States": "US",
  Canada: "CA",
  Australia: "AU",
  Japan: "JP",
} as const;

export type ShippingCountry = keyof typeof SHIPPING_COUNTRIES;

export const SHIPPING_COUNTRY_NAMES = Object.keys(SHIPPING_COUNTRIES) as ShippingCountry[];

/** ISO code for a checkout country label, or null if we don't ship there. */
export function countryIso(label: string): string | null {
  const t = label.trim();
  const match = SHIPPING_COUNTRY_NAMES.find((name) => name.toLowerCase() === t.toLowerCase());
  return match ? SHIPPING_COUNTRIES[match] : null;
}
