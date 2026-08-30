"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORY_FILTERS = [
  { value: "ALL", label: "ALL" },
  { value: "TOPS", label: "TOPS" },
  { value: "ACCESSORIES", label: "ACCESSORIES" },
  { value: "UNDERWEAR", label: "UNDERWEAR" },
  { value: "POSTERS", label: "POSTERS" },
] as const;

export type ShopCategoryFilter = (typeof CATEGORY_FILTERS)[number]["value"];

/** Only categories with a real subcategory split get a second row of pills. */
const SUBCATEGORY_FILTERS: Partial<Record<ShopCategoryFilter, { value: string; label: string }[]>> = {
  TOPS: [
    { value: "TSHIRT", label: "T-Shirts" },
    { value: "CROP", label: "Crop Tops" },
    { value: "TANKS", label: "Tanks" },
  ],
  UNDERWEAR: [
    { value: "PANTIES", label: "Panties" },
    { value: "SOCKS", label: "Socks" },
  ],
  ACCESSORIES: [
    { value: "BAGS", label: "Bags" },
    { value: "KEYCHAINS", label: "Keychains" },
  ],
};

type ShopFiltersProps = {
  activeFilter: ShopCategoryFilter;
  activeSubcategory: string | null;
};

export function ShopFilters({ activeFilter, activeSubcategory }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subcategories = SUBCATEGORY_FILTERS[activeFilter];

  const goTo = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  };

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = filter.value === activeFilter;
          return (
            <button
              key={filter.value}
              type="button"
              className={`border px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors sm:px-5 sm:py-2.5 ${
                isActive
                  ? "tt-bg-primary tt-text-on-light tt-border-light"
                  : "bg-background tt-text-on-light tt-border-light hover:tt-text-secondary"
              }`}
              aria-pressed={isActive}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("subcategory");
                if (filter.value === "ALL") {
                  params.delete("category");
                } else {
                  params.set("category", filter.value);
                }
                goTo(params);
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Subcategory pills — only shows for categories that have a real
          split (Underwear → Panties/Socks, Accessories → Bags/Keychains),
          appearing below the main row once that category is active. */}
      {subcategories ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {subcategories.map((sub) => {
            const isActive = sub.value === activeSubcategory;
            return (
              <button
                key={sub.value}
                type="button"
                className={`border px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase transition-colors ${
                  isActive
                    ? "tt-bg-soft tt-text-on-light tt-border-light"
                    : "bg-background tt-text-on-light tt-border-light hover:tt-text-secondary"
                }`}
                aria-pressed={isActive}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("category", activeFilter);
                  if (isActive) {
                    params.delete("subcategory");
                  } else {
                    params.set("subcategory", sub.value);
                  }
                  goTo(params);
                }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
