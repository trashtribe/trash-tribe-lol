"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { shouldSwapImageOnHover, type StoreProduct } from "@/lib/products";
import { formatEuro } from "@/lib/format-currency";
import {
  approximateSwatchColor,
  colorAvailableForSelection,
  computeInitialSelections,
  deriveVariantAxes,
  findMatchingVariant,
  imageForVariant,
  nextColorAfterSizeChange,
  normalizeLabel as norm,
  sizeHasAvailableStock,
} from "@/lib/variant-selection";

import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

type ShopProductCardProps = {
  product: StoreProduct;
};

export function ShopProductCard({ product }: ShopProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(product.id);
  const altImage = product.galleryImages[1];
  const useImageSwap = shouldSwapImageOnHover(product);

  const variants = product.variants;
  const { sizes, colors, mode } = useMemo(() => deriveVariantAxes(variants), [variants]);

  const [quickBuyOpen, setQuickBuyOpen] = useState(false);
  const [selections, setSelections] = useState(() => computeInitialSelections(variants));
  const { selectedSize, selectedColor } = selections;
  const panelRef = useRef<HTMLDivElement>(null);

  const effectiveSize = selectedSize ?? (sizes.length === 1 ? sizes[0] ?? null : null);
  const effectiveColor = selectedColor ?? (colors.length === 1 ? colors[0] ?? null : null);

  const matchingVariant = useMemo(
    () => findMatchingVariant(variants, mode, effectiveSize, effectiveColor),
    [variants, mode, effectiveSize, effectiveColor],
  );

  const handleSelectSize = (size: string) => {
    setSelections((prev) => ({
      selectedSize: size,
      selectedColor: nextColorAfterSizeChange(variants, mode, colors, prev.selectedColor, size),
    }));
  };

  const handleSelectColor = (color: string) => {
    setSelections((prev) => ({ ...prev, selectedColor: color }));
  };

  // Close the popover on an outside click — it's a sibling of the card's
  // link/heart button, not a modal, so nothing else does this for us.
  useEffect(() => {
    if (!quickBuyOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setQuickBuyOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [quickBuyOpen]);

  // Only actually open the picker when there's more than one size AND/OR
  // more than one color to choose between — a product with a single size
  // or single color has nothing to pick (it's already resolved via
  // effectiveSize/effectiveColor below), so popping open a panel with
  // nothing useful in it would be its own confusing dead end.
  const hasRealChoice = sizes.length > 1 || colors.length > 1;

  const handleQuickBuyClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!hasRealChoice) {
      const v = findMatchingVariant(variants, mode, effectiveSize, effectiveColor);
      if (!v) return;
      addToCart({
        product: { ...product, price: formatEuro(v.price / 100), imageSrc: imageForVariant(product, v.id) },
        quantity: 1,
        size: v.title,
        variantId: v.id,
      });
      return;
    }
    setQuickBuyOpen((open) => !open);
  };

  const confirmAdd = () => {
    if (!matchingVariant) return;
    addToCart({
      product: {
        ...product,
        price: formatEuro(matchingVariant.price / 100),
        imageSrc: imageForVariant(product, matchingVariant.id),
      },
      quantity: 1,
      size: matchingVariant.title,
      variantId: matchingVariant.id,
    });
    setQuickBuyOpen(false);
  };

  const canAdd = Boolean(matchingVariant?.isAvailable);
  // > 1, not > 0: one size/color isn't a real choice, it's already picked
  // automatically (see effectiveSize/effectiveColor above).
  const showSizeRow = (mode === "size-only" || mode === "both") && sizes.length > 1;
  const showColorRow = (mode === "color-only" || mode === "both") && colors.length > 1;

  return (
    <article className="group relative flex flex-col">
      <div className="relative h-32 overflow-hidden border tt-border-light bg-background sm:h-36 md:h-40">
        <Link
          href={`/shop/${product.slug}`}
          className="relative block h-full p-3"
        >
          {product.saleTag ? (
            <span className="absolute left-2 top-2 z-[5] tt-bg-primary px-2 py-1 text-[9px] font-bold tracking-[0.16em] tt-text-on-light uppercase">
              {product.saleTag}
            </span>
          ) : null}
          <div className="relative h-full w-full">
            <Image
              src={product.imageSrc}
              alt={product.imageAlt}
              fill
              className={`object-contain object-center transition duration-300 group-hover:scale-[1.02] ${useImageSwap ? "group-hover:opacity-0" : ""}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {useImageSwap ? (
              <Image
                src={altImage!}
                alt={product.imageAlt}
                fill
                aria-hidden="true"
                className="object-contain object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : null}
          </div>
          {!quickBuyOpen ? (
            <button
              type="button"
              onClick={handleQuickBuyClick}
              className="absolute bottom-0 left-0 right-0 z-10 translate-y-full tt-bg-primary px-2 py-2 text-center text-[9px] font-bold tracking-[0.18em] tt-text-on-light uppercase transition-transform duration-200 group-hover:translate-y-0"
            >
              Quick buy
            </button>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute right-2 top-2 z-20 border tt-border-light bg-background p-1.5 transition-colors hover:tt-text-secondary ${saved ? "tt-text-secondary" : "tt-text-on-light"}`}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      {/* Rendered as a sibling of the (overflow-hidden) image box above,
          not inside it — this panel needs to extend below that box, and
          anything positioned inside an overflow-hidden ancestor gets
          clipped there even when pushed out via a transform. That clipping
          is exactly why this silently failed to appear at all the first
          time round (the "Quick buy" button disappeared and nothing
          replaced it). */}
      {quickBuyOpen ? (
        <div
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 top-32 z-30 border tt-border-light bg-background p-3 shadow-lg sm:top-36 md:top-40"
        >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-bold tracking-[0.14em] tt-text-on-light uppercase">
                Choose options
              </p>
              <button
                type="button"
                onClick={() => setQuickBuyOpen(false)}
                aria-label="Close"
                className="text-sm leading-none tt-text-on-light transition-colors hover:tt-text-secondary"
              >
                ×
              </button>
            </div>

            {showSizeRow ? (
              <div className="mb-2">
                <p className="mb-1 text-[8px] font-bold tracking-[0.12em] text-gray-500 uppercase">
                  Size
                </p>
                <div className="flex flex-wrap gap-1">
                  {sizes.map((sizeLabel) => {
                    const unavailable = !sizeHasAvailableStock(variants, sizeLabel, mode, effectiveColor);
                    const active = effectiveSize !== null && norm(effectiveSize) === norm(sizeLabel);
                    return (
                      <button
                        key={sizeLabel}
                        type="button"
                        disabled={unavailable}
                        onClick={() => handleSelectSize(sizeLabel)}
                        className={`min-w-7 border px-1.5 py-1 text-[10px] font-bold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${active ? "tt-bg-primary tt-border-light tt-text-on-light" : "tt-border-light tt-text-on-light hover:tt-text-secondary"}`}
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
              <div className="mb-3">
                <p className="mb-1 text-[8px] font-bold tracking-[0.12em] text-gray-500 uppercase">
                  Color
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((colorLabel) => {
                    const unavailable = !colorAvailableForSelection(variants, colorLabel, mode, effectiveSize);
                    const active = effectiveColor !== null && norm(effectiveColor) === norm(colorLabel);
                    const hex = approximateSwatchColor(colorLabel);
                    const needsSizeFirst = mode === "both" && effectiveSize === null;
                    return (
                      <button
                        key={colorLabel}
                        type="button"
                        title={colorLabel}
                        disabled={unavailable || needsSizeFirst}
                        onClick={() => handleSelectColor(colorLabel)}
                        className={`h-6 w-6 rounded-full border-2 transition-[box-shadow] disabled:cursor-not-allowed disabled:opacity-35 ${active ? "ring-2 ring-[color:var(--tt-accent-secondary)] ring-offset-1 ring-offset-background" : "tt-border-light hover:opacity-95"}`}
                        style={{
                          backgroundColor: hex,
                          boxShadow: hex.toLowerCase() === "#f5f5f5" ? "inset 0 0 0 1px rgba(0,0,0,.12)" : undefined,
                        }}
                        aria-label={colorLabel}
                        aria-pressed={active}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!canAdd}
              onClick={confirmAdd}
              className="w-full tt-bg-primary py-2 text-[10px] font-bold tracking-[0.16em] tt-text-on-light uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canAdd ? "Add to cart" : "Unavailable"}
            </button>
        </div>
      ) : null}
      <div className="mt-2.5 flex flex-col gap-1">
        <Link href={`/shop/${product.slug}`} className="block transition-colors hover:tt-text-secondary">
          <h3 className="text-[11px] font-bold tracking-[0.06em] tt-text-on-light uppercase leading-snug sm:text-[12px]">
            {product.name}
          </h3>
          <p className="text-[11px] font-bold tracking-[0.05em] tt-text-on-light sm:text-[12px]">
            {product.price}
          </p>
        </Link>
      </div>
    </article>
  );
}
