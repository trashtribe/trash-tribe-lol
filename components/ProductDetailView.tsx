"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { formatEuro } from "@/lib/format-currency";
import { parseVariantTitleSegments, type StoreProduct } from "@/lib/products";

import { ShopProductCard } from "./ShopProductCard";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

function sortSizes(a: string, b: string): number {
  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"];
  const ia = order.indexOf(a.toUpperCase());
  const ib = order.indexOf(b.toUpperCase());
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  return a.localeCompare(b);
}

function norm(s: string) {
  return s.trim().toLowerCase();
}

type VariantAxesMode = "size-only" | "color-only" | "both" | "none";

function deriveVariantAxes(variants: StoreProduct["variants"]): {
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
  const colors = [...colorsSet].sort((a, b) => norm(a).localeCompare(norm(b)));

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;

  let mode: VariantAxesMode;
  if (hasSizes && hasColors) mode = "both";
  else if (hasSizes) mode = "size-only";
  else if (hasColors) mode = "color-only";
  else mode = "none";

  return { sizes, colors, mode };
}

function computeInitialSelections(variants: StoreProduct["variants"]): {
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

function variantMatchesChoice(
  v: StoreProduct["variants"][number],
  selSize: string | null,
  selColor: string | null,
  mode: VariantAxesMode,
): boolean {
  const { size, color } = parseVariantTitleSegments(v.title);

  if (mode === "size-only") {
    if (!selSize || !size) return false;
    return norm(size) === norm(selSize);
  }

  if (mode === "color-only") {
    if (!selColor || !color) return false;
    return norm(color) === norm(selColor);
  }

  if (mode === "both") {
    if (!selSize || !size || norm(size) !== norm(selSize)) return false;
    if (!selColor || !color || norm(color) !== norm(selColor)) return false;
    return true;
  }

  return false;
}

function approximateSwatchTailwind(colorLabel: string): string {
  const k = norm(colorLabel).replace(/\s+/g, "");
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

type ProductDetailViewProps = {
  product: StoreProduct;
  relatedProducts: StoreProduct[];
};

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const [quantity, setQuantity] = useState(1);

  const variants = product.variants;
  const { sizes, colors, mode } = useMemo(() => deriveVariantAxes(variants), [variants]);

  const [selections, setSelections] = useState(() => computeInitialSelections(variants));
  const { selectedSize, selectedColor } = selections;

  const setSelectedSize = useCallback((size: string | null) => {
    setSelections((prev) => ({ ...prev, selectedSize: size }));
  }, []);

  const setSelectedColor = useCallback((color: string | null) => {
    setSelections((prev) => ({ ...prev, selectedColor: color }));
  }, []);

  const effectiveSize =
    selectedSize ?? (sizes.length === 1 ? sizes[0] ?? null : null);

  const effectiveColor =
    selectedColor ?? (colors.length === 1 ? colors[0] ?? null : null);

  const matchingVariant = useMemo(() => {
    if (variants.length === 0) return null;

    if (mode === "none") {
      return variants.find((v) => v.isAvailable) ?? variants[0] ?? null;
    }

    if (mode === "size-only") {
      const eff = effectiveSize;
      if (!eff) return null;
      return (
        variants.find((v) => variantMatchesChoice(v, eff, null, "size-only")) ?? null
      );
    }

    if (mode === "color-only") {
      const eff = effectiveColor;
      if (!eff) return null;
      return (
        variants.find((v) => variantMatchesChoice(v, null, eff, "color-only")) ??
        null
      );
    }

    const sz = effectiveSize;
    const col = effectiveColor;
    if (!sz || !col) return null;
    return (
      variants.find((v) => variantMatchesChoice(v, sz, col, "both")) ?? null
    );
  }, [variants, mode, effectiveSize, effectiveColor]);

  const firstAvailableColorForSize = useCallback(
    (size: string): string | null => {
      if (mode !== "both") return null;
      const cand = variants
        .filter((v) => {
          const p = parseVariantTitleSegments(v.title);
          return (
            p.size !== null &&
            norm(p.size) === norm(size) &&
            p.color !== null &&
            v.isAvailable
          );
        })
        .map((v) => parseVariantTitleSegments(v.title).color!)
        .find(Boolean);
      if (cand) return cand;

      const any = variants
        .filter((v) => {
          const p = parseVariantTitleSegments(v.title);
          return (
            p.size !== null &&
            norm(p.size) === norm(size) &&
            p.color !== null
          );
        })
        .map((v) => parseVariantTitleSegments(v.title).color!)
        .find(Boolean);
      return any ?? colors[0] ?? null;
    },
    [colors, mode, variants],
  );

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    if (mode === "both" && colors.length > 0) {
      const nextColor = firstAvailableColorForSize(size);
      setSelectedColor(nextColor ?? null);
    }
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
  };

  const sizeHasAvailableStock = useCallback(
    (sizeLabel: string) =>
      variants.some((v) => {
        const p = parseVariantTitleSegments(v.title);
        if (!p.size || norm(p.size) !== norm(sizeLabel)) return false;
        if (!v.isAvailable) return false;
        if (
          mode === "both" &&
          effectiveColor !== null &&
          p.color !== null &&
          norm(p.color) !== norm(effectiveColor)
        ) {
          return false;
        }
        return true;
      }),
    [effectiveColor, mode, variants],
  );

  const colorAvailableForSelection = useCallback(
    (colorLabel: string) => {
      if (mode === "color-only") {
        return variants.some((v) => {
          const p = parseVariantTitleSegments(v.title);
          return (
            p.color !== null &&
            norm(p.color) === norm(colorLabel) &&
            v.isAvailable
          );
        });
      }
      if (mode === "both") {
        const sz = effectiveSize;
        if (!sz) return false;
        return variants.some(
          (v) =>
            variantMatchesChoice(v, sz, colorLabel, "both") && v.isAvailable,
        );
      }
      return false;
    },
    [effectiveSize, mode, variants],
  );

  const gallery = product.galleryImages.slice(0, 4);
  const showCompareAt =
    product.originalPrice.trim() !== "" && product.originalPrice.trim() !== product.price.trim();

  const priceLabel =
    matchingVariant != null ? formatEuro(matchingVariant.price / 100) : product.price;

  const canAdd = Boolean(matchingVariant?.isAvailable);

  const showSizeRow =
    (mode === "size-only" || mode === "both") && sizes.length > 0;
  const showColorRow =
    (mode === "color-only" || mode === "both") && colors.length > 0;

  return (
    <main className="flex flex-1 flex-col bg-background">
      <section className="border-b tt-border-light px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-square overflow-hidden border tt-border-light bg-background p-5">
              <Image
                src={gallery[0] ?? product.imageSrc}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
                priority
              />
            </div>
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((imageSrc, idx) => (
                <li key={`${product.id}-thumb-${idx}`}>
                  <div className="relative aspect-square overflow-hidden border tt-border-light bg-background p-2">
                    <Image
                      src={imageSrc}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="25vw"
                      className="object-contain object-center"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-[0.14em] tt-text-on-light uppercase sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-end gap-3">
              {showCompareAt ? (
                <p className="text-lg text-[color:color-mix(in_srgb,var(--tt-text-on-light)_60%,transparent)] line-through">
                  {product.originalPrice}
                </p>
              ) : null}
              <p className="text-2xl font-bold tt-text-secondary">{priceLabel}</p>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed tt-text-on-light sm:text-base">
              {product.description}
            </p>

            {showSizeRow ? (
              <div className="mt-8">
                <p className="mb-3 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((sizeLabel) => {
                    const unavailable = !sizeHasAvailableStock(sizeLabel);
                    const active =
                      effectiveSize !== null && norm(effectiveSize) === norm(sizeLabel);
                    return (
                      <button
                        key={sizeLabel}
                        type="button"
                        disabled={unavailable}
                        onClick={() => handleSelectSize(sizeLabel)}
                        className={`min-w-11 border px-3 py-2 text-xs font-bold tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${active ? "tt-bg-primary tt-border-light tt-text-on-light" : "tt-border-light tt-text-on-light hover:tt-text-secondary"}`}
                        aria-pressed={active}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {showColorRow ? (
              <div className="mt-8">
                <p className="mb-3 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
                  Color
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((colorLabel) => {
                    const unavailable = !colorAvailableForSelection(colorLabel);
                    const active =
                      effectiveColor !== null &&
                      norm(effectiveColor) === norm(colorLabel);
                    const hex = approximateSwatchTailwind(colorLabel);
                    const needsSizeBeforeColor =
                      mode === "both" && effectiveSize === null;
                    return (
                      <button
                        key={colorLabel}
                        type="button"
                        title={colorLabel}
                        disabled={unavailable || needsSizeBeforeColor}
                        onClick={() => handleSelectColor(colorLabel)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-[box-shadow] disabled:cursor-not-allowed disabled:opacity-35 ${active ? "ring-2 ring-[color:var(--tt-accent-secondary)] ring-offset-2 ring-offset-background" : "tt-border-light hover:opacity-95"}`}
                        style={{
                          backgroundColor: hex,
                          boxShadow:
                            hex.toLowerCase() === "#f5f5f5"
                              ? "inset 0 0 0 1px rgba(0,0,0,.12)"
                              : undefined,
                        }}
                        aria-label={colorLabel}
                        aria-pressed={active}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!canAdd && variants.length > 0 && mode !== "none" ? (
              <p className="mt-4 text-xs tt-text-secondary" role="status">
                This combination is unavailable. Pick another option.
              </p>
            ) : null}

            <div className="mt-8">
              <p className="mb-3 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
                Quantity
              </p>
              <div className="inline-flex items-center border tt-border-light">
                <button
                  type="button"
                  className="h-10 w-10 text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="inline-flex h-10 w-10 items-center justify-center text-sm font-bold tt-text-on-light">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="h-10 w-10 text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                disabled={!canAdd || matchingVariant === null}
                onClick={() => {
                  if (!matchingVariant) return;
                  const lineProduct: StoreProduct = {
                    ...product,
                    price: formatEuro(matchingVariant.price / 100),
                  };
                  addToCart({
                    product: lineProduct,
                    quantity,
                    size: matchingVariant.title,
                    variantId: matchingVariant.id,
                  });
                }}
                className="w-full bg-[color:var(--tt-bg-dark)] px-6 py-4 text-sm font-bold tracking-[0.2em] tt-text-primary uppercase transition-colors hover:tt-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`text-xs font-bold tracking-[0.16em] uppercase underline underline-offset-4 transition-colors ${wishlisted ? "tt-text-secondary" : "tt-text-on-light hover:tt-text-secondary"}`}
              >
                {wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              </button>
              <p className="text-sm tt-text-on-light">Free shipping over €100</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[1600px]">
          <h2 className="mb-8 text-2xl font-bold tracking-[0.18em] tt-text-on-light uppercase sm:text-3xl">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <ShopProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
