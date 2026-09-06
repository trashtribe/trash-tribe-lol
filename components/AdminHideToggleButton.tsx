"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminHideToggleButtonProps = {
  productId: string;
  hidden: boolean;
};

// Was temporarily true while diagnosing Printify's account-wide "Product is
// disabled for editing" (error 8252) lock — root cause found and fixed (see
// acknowledgePrintifyPublishSucceeded in lib/printify.ts + the webhook
// route), confirmed via a real PUT request that products are editable again.
const WRITES_DISABLED = false;

export function AdminHideToggleButton({ productId, hidden }: AdminHideToggleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localHidden, setLocalHidden] = useState(hidden);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, tag: "hide-on-site", on: !localHidden }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          `${res.status} ${res.statusText}${body?.error ? ` — ${body.error}` : ""}`,
        );
      }
      setLocalHidden((v) => !v);
      router.refresh();
    } catch (e) {
      window.alert(
        `Couldn't update the product: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || WRITES_DISABLED}
      title={WRITES_DISABLED ? "Paused while we investigate a Printify account issue." : undefined}
      className={`shrink-0 border px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors disabled:opacity-50 ${
        localHidden
          ? "tt-bg-primary tt-border-light tt-text-on-light"
          : "bg-background tt-border-light tt-text-on-light hover:tt-text-secondary"
      }`}
    >
      {loading ? "..." : WRITES_DISABLED ? "Paused" : localHidden ? "Show" : "Hide"}
    </button>
  );
}
