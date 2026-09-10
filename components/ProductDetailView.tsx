"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

import { formatEuro } from "@/lib/format-currency";
import type { StoreProduct } from "@/lib/products";
import {
  approximateSwatchColor,
  colorAvailableForSelection,
  computeInitialSelections,
  deriveVariantAxes,
  findMatchingVariant,
  firstAvailableColorForSize,
  normalizeLabel as norm,
  sizeHasAvailableStock,
} from "@/lib/variant-selection";

import { ShopProductCard } from "./ShopProductCard";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

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

  const matchingVariant = useMemo(
    () => findMatchingVariant(variants, mode, effectiveSize, effectiveColor),
    [variants, mode, effectiveSize, effectiveColor],
  );

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    if (mode === "both" && colors.length > 0) {
      const nextColor = firstAvailableColorForSize(variants, mode, colors, size);
      setSelectedColor(nextColor ?? null);
    }
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
  };

  const sizeHasStock = useCallback(
    (sizeLabel: string) => sizeHasAvailableStock(variants, sizeLabel, mode, effectiveColor),
    [effectiveColor, mode, variants],
  );

  const colorHasStock = useCallback(
    (colorLabel: string) => colorAvailableForSelection(variants, colorLabel, mode, effectiveSize),
    [effectiveSize, mode, variants],
  );

  // Printify tags each image with the variant ids it depicts (e.g. one set of
  // shots per color). When the selected variant has its own images, show
  // those instead of the full mixed-color gallery.
  const variantGallery = useMemo(() => {
    if (!matchingVariant) return null;
    const forVariant = product.images
      .filter((img) => img.variantIds.includes(matchingVariant.id))
      .map((img) => img.src);
    return forVariant.length > 0 ? forVariant : null;
  }, [product.images, matchingVariant]);

  const gallery = useMemo(
    () => (variantGallery ?? product.galleryImages).slice(0, 4),
    [variantGallery, product.galleryImages],
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // When the selected color/variant swaps in a different photo set, snap
  // back to the first shot instead of pointing at a now out-of-range (or
  // just mismatched) thumbnail. Adjusting state during render (rather than
  // in an effect) avoids an extra render pass — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // Compared by content (not array identity): if `gallery`'s useMemo ever
  // recomputed to a new-but-equal array on an unrelated render (e.g. a
  // thumbnail click), reference equality would treat that as "the gallery
  // changed" and reset selectedImageIndex back to 0 on every click —
  // exactly the "clicking does nothing" symptom reported.
  const gallerySignature = gallery.join("|");
  const [renderedGallerySignature, setRenderedGallerySignature] = useState(gallerySignature);
  if (renderedGallerySignature !== gallerySignature) {
    setRenderedGallerySignature(gallerySignature);
    setSelectedImageIndex(0);
  }

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
              {/* All gallery shots are stacked and preloaded up front (gallery
                  is curated down to ~2 images per color, so this is cheap),
                  then toggled with opacity — swapping <img src> on click was
                  forcing a fresh network fetch of the full-size image every
                  time, which read as a slow, laggy thumbnail switch. */}
              {gallery.map((imageSrc, idx) => (
                <Image
                  key={idx}
                  src={imageSrc}
                  alt={product.imageAlt}
                  aria-hidden={idx !== selectedImageIndex}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-contain object-center transition-opacity duration-150 ${idx === selectedImageIndex ? "opacity-100" : "opacity-0"}`}
                  priority={idx < 2}
                />
              ))}
            </div>
            {gallery.length > 1 ? (
              <ul className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((imageSrc, idx) => {
                  const active = idx === selectedImageIndex;
                  return (
                    <li key={`${product.id}-thumb-${idx}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        aria-label={`View image ${idx + 1} of ${product.name}`}
                        aria-pressed={active}
                        className={`relative block aspect-square w-full overflow-hidden border-2 bg-background p-2 transition-colors ${active ? "border-[color:var(--tt-text-on-light)]" : "tt-border-light hover:border-[color:var(--tt-text-on-light)]"}`}
                      >
                        <Image
                          src={imageSrc}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          sizes="25vw"
                          className="object-contain object-center"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
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
                    const unavailable = !sizeHasStock(sizeLabel);
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
                    const unavailable = !colorHasStock(colorLabel);
                    const active =
                      effectiveColor !== null &&
                      norm(effectiveColor) === norm(colorLabel);
                    const hex = approximateSwatchColor(colorLabel);
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
