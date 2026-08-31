import type { Metadata } from "next";
import Image from "next/image";

import { AdminHideToggleButton } from "@/components/AdminHideToggleButton";
import { getAdminProductList } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin — Productos",
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
        Productos
      </h1>
      <p className="mt-2 text-[12px] tracking-[0.04em] text-gray-500">
        {products.length} productos · {hiddenCount} ocultos ahora mismo. Ocultar aquí no borra
        nada en Printify — solo le pone el tag &quot;hide-on-site&quot; y lo saca de la web.
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
            <AdminHideToggleButton productId={p.id} hidden={p.hidden} />
          </li>
        ))}
      </ul>
    </main>
  );
}
