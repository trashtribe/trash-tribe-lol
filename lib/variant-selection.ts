import { parseVariantTitleSegments, type StoreProduct } from "@/lib/products";

/**
 * Shared size/color variant-picking logic, used by both the full product
 * page (ProductDetailView) and the shop grid's "Quick buy" popover
 * (ShopProductCard) so a customer can pick a size/color without navigating
 * away from the shop grid. Pulled out of ProductDetailView so it isn't
 * duplicated between the two.
 */

export function sortSizes(a: string, b: string): number {
  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"];
  const ia = order.indexOf(a.toUpperCase());
  const ib = order.indexOf(b.toUpperCase());
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.localeCompare(b);
}

export function normalizeLabel(s: string) {
  return s.trim().toLowerCase();
}

export type VariantAxesMode = "size-only" | "color-only" | "both" | "none";

type Variant = StoreProduct["variants"][number];

export function deriveVariantAxes(variants: Variant[]): {
  sizes: string[];
  colors: string[];
  mode: VariantAxesMode;
} {
  const sizesSet = new Set<string>();
  const colorsSet = new Set<string>();

  for (const v of variants) {
    const { size, color } = parseVariantTitleSegments(v.title);
    if (size) sizesSet.add(size);
    if (color) colorsSet.add(color);
  }

  const sizes = [...sizesSet].sort(sortSizes);
  const colors = [...colorsSet].sort((a, b) => normalizeLabel(a).localeCompare(normalizeLabel(b)));

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  let mode: VariantAxesMode;
  if (hasSizes && hasColors) mode = "both";
  else if (hasSizes) mode = "size-only";
  else if (hasColors) mode = "color-only";
  else mode = "none";

  return { sizes, colors, mode };
}

export function computeInitialSelections(variants: Variant[]): {
  selectedSize: string | null;
  selectedColor: string | null;
} {
  const { sizes, colors, mode } = deriveVariantAxes(variants);
  const firstAvail = variants.find((v) => v.isAvailable) ?? variants[0];
  const parsed = firstAvail ? parseVariantTitleSegments(firstAvail.title) : { size: null, color: null };

  if (mode === "size-only") {
    return {
      selectedSize: parsed.size ?? sizes[0] ?? null,
      selectedColor: null,
    };
  }
  if (mode === "color-only") {
    return {
      selectedSize: null,
      selectedColor: parsed.color ?? colors[0] ?? null,
    };
  }
  if (mode === "both") {
    return {
      selectedSize: parsed.size ?? sizes[0] ?? null,
      selectedColor: parsed.color ?? colors[0] ?? null,
    };
  }
  return { selectedSize: null, selectedColor: null };
}

export function variantMatchesChoice(
  v: Variant,
  selSize: string | null,
  selColor: string | null,
  mode: VariantAxesMode,
): boolean {
  const { size, color } = parseVariantTitleSegments(v.title);

  if (mode === "size-only") {
    if (!selSize || !size) return false;
    return normalizeLabel(size) === normalizeLabel(selSize);
  }

  if (mode === "color-only") {
    if (!selColor || !color) return false;
    return normalizeLabel(color) === normalizeLabel(selColor);
  }

  if (mode === "both") {
    if (!selSize || !size || normalizeLabel(size) !== normalizeLabel(selSize)) return false;
    if (!selColor || !color || normalizeLabel(color) !== normalizeLabel(selColor)) return false;
    return true;
  }

  return false;
}

export function findMatchingVariant(
  variants: Variant[],
  mode: VariantAxesMode,
  effectiveSize: string | null,
  effectiveColor: string | null,
): Variant | null {
  if (variants.length === 0) return null;

  if (mode === "none") {
    return variants.find((v) => v.isAvailable) ?? variants[0] ?? null;
  }

  if (mode === "size-only") {
    if (!effectiveSize) return null;
    return variants.find((v) => variantMatchesChoice(v, effectiveSize, null, "size-only")) ?? null;
  }

  if (mode === "color-only") {
    if (!effectiveColor) return null;
    return variants.find((v) => variantMatchesChoice(v, null, effectiveColor, "color-only")) ?? null;
  }

  if (!effectiveSize || !effectiveColor) return null;
  return variants.find((v) => variantMatchesChoice(v, effectiveSize, effectiveColor, "both")) ?? null;
}

export function firstAvailableColorForSize(
  variants: Variant[],
  mode: VariantAxesMode,
  colors: string[],
  size: string,
): string | null {
  if (mode !== "both") return null;
  const cand = variants
    .filter((v) => {
      const p = parseVariantTitleSegments(v.title);
      return p.size !== null && normalizeLabel(p.size) === normalizeLabel(size) && p.color !== null && v.isAvailable;
    })
    .map((v) => parseVariantTitleSegments(v.title).color!)
    .find(Boolean);
  if (cand) return cand;

  const any = variants
    .filter((v) => {
      const p = parseVariantTitleSegments(v.title);
      return p.size !== null && normalizeLabel(p.size) === normalizeLabel(size) && p.color !== null;
    })
    .map((v) => parseVariantTitleSegments(v.title).color!)
    .find(Boolean);
  return any ?? colors[0] ?? null;
}

export function sizeHasAvailableStock(
  variants: Variant[],
  sizeLabel: string,
  mode: VariantAxesMode,
  effectiveColor: string | null,
): boolean {
  return variants.some((v) => {
    const p = parseVariantTitleSegments(v.title);
    if (!p.size || normalizeLabel(p.size) !== normalizeLabel(sizeLabel)) return false;
    if (!v.isAvailable) return false;
    if (mode === "both" && effectiveColor !== null && p.color !== null && normalizeLabel(p.color) !== normalizeLabel(effectiveColor)) {
      return false;
    }
    return true;
  });
}

export function colorAvailableForSelection(
  variants: Variant[],
  colorLabel: string,
  mode: VariantAxesMode,
  effectiveSize: string | null,
): boolean {
  if (mode === "color-only") {
    return variants.some((v) => {
      const p = parseVariantTitleSegments(v.title);
      return p.color !== null && normalizeLabel(p.color) === normalizeLabel(colorLabel) && v.isAvailable;
    });
  }
  if (mode === "both") {
    if (!effectiveSize) return false;
    return variants.some((v) => variantMatchesChoice(v, effectiveSize, colorLabel, "both") && v.isAvailable);
  }
  return false;
}

export function approximateSwatchColor(colorLabel: string): string {
  const k = normalizeLabel(colorLabel).replace(/\s+/g, "");
  if (k.includes("black")) return "#111111";
  if (k.includes("white")) return "#f5f5f5";
  if (k.includes("navy")) return "#1a2744";
  if (k.includes("grey") || k.includes("gray")) return "#8a8a8a";
  if (k.includes("pink")) return "#ffb6d9";
  if (k.includes("red")) return "#cc2222";
  if (k.includes("blue")) return "#2860d8";
  if (k.includes("green")) return "#226644";
  if (k.includes("yellow")) return "#e6d400";
  if (k.includes("orange")) return "#e07020";
  if (k.includes("purple")) return "#6844aa";
  if (k.includes("brown")) return "#6b4423";
  return "#dcdcdc";
}
