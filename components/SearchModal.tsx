"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { products } from "./product-data";
import { ShopProductCard } from "./ShopProductCard";
import { useSearchModal } from "./SearchModalContext";

function matchesQuery(product: (typeof products)[number], q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  const hay = [
    product.name,
    product.description,
    product.category,
    product.price,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export function SearchModal() {
  const { isOpen, closeSearch } = useSearchModal();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return products.filter((p) => matchesQuery(p, q));
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim();
  const showNoResults = trimmed.length > 0 && filtered.length === 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div className="flex shrink-0 justify-end px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={closeSearch}
          className="flex h-12 w-12 items-center justify-center text-2xl tt-text-on-dark transition-colors hover:tt-text-secondary"
          aria-label="Close search"
        >
          ×
        </button>
      </div>

      <div className="shrink-0 px-4 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <label htmlFor="search-modal-input" className="sr-only">
            Search products
          </label>
          <input
            ref={inputRef}
            id="search-modal-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            autoComplete="off"
            className="w-full border-2 tt-border-light bg-background px-6 py-5 text-xl font-bold tracking-wide tt-text-on-light placeholder:text-[color:color-mix(in_srgb,var(--tt-text-on-light)_45%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--tt-accent-secondary)] sm:text-2xl"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-[1600px]">
          {trimmed.length === 0 ? (
            <p className="text-center text-sm tt-text-on-dark sm:text-base">
              Start typing to search the catalog.
            </p>
          ) : showNoResults ? (
            <p className="text-center text-sm font-bold tracking-wide tt-text-on-dark uppercase sm:text-base">
              No results match your search.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
