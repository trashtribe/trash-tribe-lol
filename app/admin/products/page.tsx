import type { Metadata } from "next";
import Image from "next/image";

import { AdminHideToggleButton } from "@/components/AdminHideToggleButton";
import { AdminTwoSidedToggleButton } from "@/components/AdminTwoSidedToggleButton";
import { getAdminProductList } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin — Products",
  robots: { index: false, follow: false },
};

// Always hits Printify fresh (well, fresh per the fetch-level cache in
// lib/printify.ts) rather than getting statically optimized — this page
// only exists to act on live data.
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProductList();
  const hiddenCount = products.filter((p) => p.hidden).length;

  return (
    <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-2xl">
        Products
      </h1>
      <p className="mt-2 text-[12px] tracking-[0.04em] text-gray-500">
        {products.length} products · {hiddenCount} hidden right now. Hiding here doesn&apos;t
        delete anything in Printify — it just adds the &quot;hide-on-site&quot; tag and pulls it
        off the site. For Tops (tees, tanks, hoodies...), &quot;Mark two-sided&quot; flags a
        product that has a real design on both front and back, so its card swaps photos on hover
        instead of showing the plain mockup back.
      </p>

      <ul className="mt-8 flex flex-col divide-y tt-border-light border-y tt-border-light">
        {products.map((p) => (
          <li key={p.id} className="flex items-center gap-4 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden border tt-border-light bg-background">
              <Image src={p.imageSrc} alt={p.name} fill sizes="64px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold tracking-[0.06em] tt-text-on-light uppercase">
                {p.name}
              </p>
              <p className="text-[11px] tracking-[0.1em] text-gray-500 uppercase">{p.category}</p>
            </div>
            {p.category === "TOPS" ? (
              <AdminTwoSidedToggleButton productId={p.id} twoSidedPrint={p.twoSidedPrint} />
            ) : null}
            <AdminHideToggleButton productId={p.id} hidden={p.hidden} />
          </li>
        ))}
      </ul>
    </main>
  );
}
