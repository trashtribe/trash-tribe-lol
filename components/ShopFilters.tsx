"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = ["ALL", "POSTERS", "APPAREL", "ACCESSORIES"] as const;

export type ShopCategoryFilter = (typeof FILTERS)[number];

type ShopFiltersProps = {
  activeFilter: ShopCategoryFilter;
};

export function ShopFilters({ activeFilter }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {FILTERS.map((filter) => {
        const isActive = filter === activeFilter;
        return (
          <button
            key={filter}
            type="button"
            className={`border px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors sm:px-5 sm:py-2.5 ${
              isActive
                ? "tt-bg-primary tt-text-on-light tt-border-light"
                : "bg-background tt-text-on-light tt-border-light hover:tt-text-secondary"
            }`}
            aria-pressed={isActive}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              if (filter === "ALL") {
                params.delete("category");
              } else {
                params.set("category", filter);
              }
              const query = params.toString();
              router.push(query ? `/shop?${query}` : "/shop");
            }}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
