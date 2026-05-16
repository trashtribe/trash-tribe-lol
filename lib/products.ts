import { cache } from "react";

import {
  fetchPrintifyProducts,
  type PrintifyProduct,
  type PrintifyVariant,
} from "@/lib/printify";

export type StoreCategory = "POSTERS" | "APPAREL" | "ACCESSORIES";

export type StoreProductVariant = {
  id: string;
  size: string;
  color: string;
  price: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
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

function formatCents(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function parseVariantLabels(variant: PrintifyVariant): { size: string; color: string } {
  const opts = variant.options;
  if (opts && typeof opts === "object") {
    const o = opts as Record<string, string | number | undefined>;
    const sizeRaw =
      o.size ?? o.Size ?? o.dimensions ?? o["Dimensions"] ?? o["Clothing size"] ?? o["Sizes"];
    const colorRaw =
      o.color ?? o.Color ?? o.colour ?? o.Colour ?? o.colors ?? o["Colors"];
    const size =
      sizeRaw !== undefined && String(sizeRaw).trim() !== ""
        ? String(sizeRaw)
        : "";
    const color =
      colorRaw !== undefined && String(colorRaw).trim() !== ""
        ? String(colorRaw)
        : "";
    if (size || color) {
      return {
        size: size || "One size",
        color: color || "—",
      };
    }
  }

  const title = variant.title?.trim() ?? "";
  const parts = title.split("/").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { color: parts[0]!, size: parts[1]! };
  }
  if (parts.length === 1) {
    return { color: "—", size: parts[0]! };
  }
  return { color: "—", size: "One size" };
}

function isVariantSellable(v: PrintifyVariant): boolean {
  if (v.is_enabled === false) return false;
  if (v.is_available === false) return false;
  return Number.isFinite(v.price);
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

export function mapPrintifyProduct(p: PrintifyProduct): StoreProduct {
  const id = String(p.id);
  const name = p.title?.trim() || "Untitled";
  const slugBase = slugify(name) || `product-${id}`;
  const description = stripHtml(p.description ?? "");
  const imageAlt = name;

  const sellable = (p.variants ?? []).filter(isVariantSellable);
  const priceSamples = sellable.map((v) => v.price).filter((n) => Number.isFinite(n));
  const minCents = priceSamples.length > 0 ? Math.min(...priceSamples) : 0;
  const maxCents = priceSamples.length > 0 ? Math.max(...priceSamples) : 0;

  const price = formatCents(minCents);
  const originalPrice =
    maxCents > minCents && maxCents > 0 ? formatCents(maxCents) : price;

  const galleryImages = galleryFromProduct(p);
  const imageSrc = galleryImages[0] ?? "/globe.svg";

  const variants: StoreProductVariant[] =
    sellable.length > 0
      ? sellable.map((v) => {
          const { size, color } = parseVariantLabels(v);
          return {
            id: String(v.id),
            size,
            color,
            price: formatCents(v.price),
          };
        })
      : [
          {
            id: `${id}-default`,
            size: "One size",
            color: "—",
            price,
          },
        ];

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
