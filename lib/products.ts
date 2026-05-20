import { cache } from "react";

import {
  fetchPrintifyProducts,
  type PrintifyProduct,
  type PrintifyVariant,
  type PrintifyVariantRow,
} from "@/lib/printify";

export type StoreCategory = "POSTERS" | "APPAREL" | "ACCESSORIES";

export type StoreProductVariant = {
  id: number;
  title: string;
  isAvailable: boolean;
  /** Price in minor units (same as Printify: cents when currency is EUR). */
  price: number;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Display formatted min variant price */
  price: string;
  originalPrice: string;
  imageSrc: string;
  imageAlt: string;
  galleryImages: string[];
  category: StoreCategory;
  variants: StoreProductVariant[];
  /** Optional merchandising label (seed catalog / future providers). */
  saleTag?: string;
};

const DISPLAY_CURRENCY = process.env.PRINTIFY_DISPLAY_CURRENCY?.trim() || "EUR";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Decode common double-encoded entities Printify sends when `&` was escaped as `&amp;`. */
function decodeHtmlEntities(html: string): string {
  return html
    .replaceAll("&amp;#39;", "'")
    .replaceAll("&amp;amp;", "&")
    .replaceAll("&amp;lt;", "<")
    .replaceAll("&amp;gt;", ">");
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function coerceOptionsArray(raw: unknown): (string | number)[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((v) => v != null && `${String(v).trim()} !== ""`);
  }
  if (typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).filter(
      (v) => v != null && `${String(v).trim()}` !== "",
    ) as (string | number)[];
  }
  return [];
}

function normalizePrintifyVariant(row: PrintifyVariantRow): PrintifyVariant | null {
  const idNum = typeof row.id === "string" ? Number.parseInt(row.id, 10) : Number(row.id);
  const priceNum = typeof row.price === "number" ? row.price : Number(row.price);

  if (!Number.isFinite(idNum) || !Number.isFinite(priceNum)) return null;

  const options = coerceOptionsArray(row.options);
  const trimmedTitle =
    typeof row.title === "string" && row.title.trim() !== "" ? row.title.trim() : "";
  const synthesizedTitle =
    trimmedTitle ||
    (options.length > 0 ? options.map((o) => String(o).trim()).join(" / ") : `Variant ${idNum}`);

  const isAvailable = row.is_available !== false && row.is_enabled !== false;

  return {
    id: idNum,
    title: synthesizedTitle,
    options,
    is_available: isAvailable,
    price: priceNum,
  };
}

function inferCategory(p: PrintifyProduct): StoreCategory {
  const tags = (p.tags ?? []).map((t) => t.toLowerCase()).join(" ");
  const title = (p.title ?? "").toLowerCase();
  const blob = `${tags} ${title}`;

  const looksApparel =
    /\b(tee|t-?shirt|shirt|hoodie|sweatshirt|tank|cap|hat|beanie|joggers|shorts|socks|crewneck|sweater)\b/.test(
      blob,
    );

  if (looksApparel) {
    return "APPAREL";
  }

  if (
    /\b(poster|wall art|art print|gicl[eé]e|canvas print)\b/.test(blob) ||
    (/\bprint\b/.test(blob) && !/\b(tee|t-?shirt|shirt)\b/.test(blob))
  ) {
    return "POSTERS";
  }

  if (
    /\b(mug|keychain|tote|pin|phone case|sticker|pillow|mousepad|coaster|accessory)\b/.test(blob)
  ) {
    return "ACCESSORIES";
  }

  return "ACCESSORIES";
}

function galleryFromProduct(p: PrintifyProduct): string[] {
  const fromImages = (p.images ?? [])
    .map((img) => img.src)
    .filter((src): src is string => Boolean(src?.trim()));
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const src of fromImages) {
    if (seen.has(src)) continue;
    seen.add(src);
    unique.push(src);
  }
  return unique;
}

/**
 * Detect whether a slash-separated segment is likely an apparel/size token.
 * Printify often titles variants as **"Color / Size"** (e.g. `Black / M`), not size-first.
 */
function segmentLooksLikeSize(segment: string): boolean {
  const raw = segment.trim();
  if (!raw) return false;

  const compact = raw.replace(/\s+/g, "").toUpperCase();
  const upperSpaced = raw.replace(/\s+/g, " ").trim().toUpperCase();

  const codes = new Set([
    "XXS",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
  ]);
  if (codes.has(compact)) return true;

  if (compact === "OS" || compact === "O/S") return true;

  if (
    upperSpaced === "ONE SIZE" ||
    upperSpaced.startsWith("ONE SIZE ") ||
    compact === "ONESIZE"
  ) {
    return true;
  }

  if (
    /^(SMALL|MEDIUM|LARGE|X-LARGE|X-SMALL|EXTRA SMALL|EXTRA LARGE)$/i.test(raw.trim())
  ) {
    return true;
  }

  // Numeric-only garment sizes (EU/US/kids shoe, etc.)
  if (/^\d{1,3}$/.test(raw.trim())) return true;

  // Toddler sizes like 4T
  if (/^\d{1,2}T$/i.test(compact)) return true;

  return false;
}

/**
 * Split Printify variant titles into **size** and/or **color** axes.
 *
 * - If the title contains ` / `, split into segments and assign size vs color (Printify often uses
 *   **Color / Size**; we detect the size token where possible).
 * - If there is no slash, treat the whole title as **either** a known size label **or** a single color option.
 */
export function parseVariantTitleSegments(title: string): {
  size: string | null;
  color: string | null;
} {
  const t = title.trim();
  if (!t) return { size: null, color: null };

  if (!t.includes("/")) {
    if (segmentLooksLikeSize(t)) {
      return { size: t, color: null };
    }
    return { size: null, color: t };
  }

  const parts = t.split("/").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return { size: null, color: null };
  if (parts.length === 1) {
    const only = parts[0]!;
    if (segmentLooksLikeSize(only)) return { size: only, color: null };
    return { size: null, color: only };
  }

  const sizeIndices = parts
    .map((p, i) => (segmentLooksLikeSize(p) ? i : -1))
    .filter((i): i is number => i >= 0);

  // Exactly one size-like segment → that segment is size; the rest joined is color.
  if (sizeIndices.length === 1) {
    const si = sizeIndices[0]!;
    const sizePart = parts[si]!.trim();
    const colorJoined = parts.filter((_, i) => i !== si).join(" / ").trim();
    return {
      size: sizePart,
      color: colorJoined.length > 0 ? colorJoined : null,
    };
  }

  // No recognized size tokens — try common Printify **color / size** order, then **size / color**.
  if (sizeIndices.length === 0) {
    const last = parts[parts.length - 1]!;
    if (segmentLooksLikeSize(last)) {
      const colorJoined = parts.slice(0, -1).join(" / ").trim();
      return {
        size: last.trim(),
        color: colorJoined.length > 0 ? colorJoined : null,
      };
    }
    const first = parts[0]!;
    if (segmentLooksLikeSize(first)) {
      const colorJoined = parts.slice(1).join(" / ").trim();
      return {
        size: first.trim(),
        color: colorJoined.length > 0 ? colorJoined : null,
      };
    }
    return { size: null, color: parts.join(" / ").trim() };
  }

  // Multiple size-like segments (e.g. numeric inseams) — fall back to **size-first**.
  const size = parts[0]!.trim();
  const color = parts.slice(1).join(" / ").trim();
  return {
    size,
    color: color.length > 0 ? color : null,
  };
}

export function mapPrintifyProduct(p: PrintifyProduct): StoreProduct {
  const id = String(p.id);
  const name = p.title?.trim() || "Untitled";
  const slugBase = slugify(name) || `product-${id}`;
  const description = decodeHtmlEntities(stripHtml(p.description ?? ""));
  const imageAlt = name;

  const rows = (p.variants ?? [])
    .map((v) => normalizePrintifyVariant(v))
    .filter((v): v is PrintifyVariant => Boolean(v));

  const variants: StoreProductVariant[] = rows.map((v) => ({
    id: v.id,
    title: v.title,
    isAvailable: v.is_available,
    price: v.price,
  }));

  let price = formatCents(0);
  let originalPrice = formatCents(0);

  if (variants.length > 0) {
    const allPrices = variants.map((v) => v.price);
    const availablePrices = variants.filter((v) => v.isAvailable).map((v) => v.price);
    const pool = availablePrices.length > 0 ? availablePrices : allPrices;
    const minCents = Math.min(...pool);
    const maxCents = Math.max(...allPrices);
    price = formatCents(minCents);
    originalPrice = maxCents > minCents ? formatCents(maxCents) : price;
  }

  const galleryImages = galleryFromProduct(p);
  const imageSrc = galleryImages[0] ?? "/globe.svg";

  return {
    id,
    slug: slugBase,
    name,
    description,
    price,
    originalPrice,
    imageSrc,
    imageAlt,
    galleryImages: galleryImages.length > 0 ? galleryImages : [imageSrc],
    category: inferCategory(p),
    variants,
  };
}

async function loadProducts(): Promise<StoreProduct[]> {
  const raw = await fetchPrintifyProducts();
  const visible = raw.filter((item) => item.visible !== false);
  const mapped = visible.map(mapPrintifyProduct);

  const slugCounts = new Map<string, number>();
  return mapped.map((product) => {
    const n = slugCounts.get(product.slug) ?? 0;
    slugCounts.set(product.slug, n + 1);
    if (n === 0) return product;
    return {
      ...product,
      slug: `${product.slug}-${product.id.slice(-6)}`,
    };
  });
}

/** Cached per request; dedupes repeated calls in RSC trees and metadata. */
export const getProducts = cache(loadProducts);

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  const products = await getProducts();
  return products.find((item) => item.slug === slug) ?? null;
}
