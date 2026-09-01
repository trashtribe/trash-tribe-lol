"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminTwoSidedToggleButtonProps = {
  productId: string;
  twoSidedPrint: boolean;
};

/**
 * Only matters for Tops (tees, tanks, hoodies...) — see
 * shouldSwapImageOnHover() in lib/products.ts. Marking a product here makes
 * its card swap to the second photo on hover, for the rare shirt with a real
 * front-and-back design instead of a blank mockup back.
 */
export function AdminTwoSidedToggleButton({
  productId,
  twoSidedPrint,
}: AdminTwoSidedToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localTwoSided, setLocalTwoSided] = useState(twoSidedPrint);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          tag: "two-sided-print",
          on: !localTwoSided,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setLocalTwoSided((v) => !v);
      router.refresh();
    } catch {
      window.alert("Couldn't update the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`shrink-0 border px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors disabled:opacity-50 ${
        localTwoSided
          ? "tt-bg-primary tt-border-light tt-text-on-light"
          : "bg-background tt-border-light tt-text-on-light hover:tt-text-secondary"
      }`}
    >
      {loading ? "..." : localTwoSided ? "Two-sided ✓" : "Mark two-sided"}
    </button>
  );
}
