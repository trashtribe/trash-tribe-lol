import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchPrintifyProductById } from "@/lib/printify";

export const metadata: Metadata = {
  title: "Admin — Edit product",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const product = await fetchPrintifyProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[700px] px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/admin/products"
        className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase hover:tt-text-secondary"
      >
        ← Back to products
      </Link>

      <h1 className="mt-4 text-xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-2xl">
        Edit product
      </h1>

      {error ? (
        <p className="mt-3 text-[12px] font-bold tracking-[0.05em] text-red-600">
          Title can&apos;t be empty.
        </p>
      ) : null}

      <form method="POST" action="/api/admin/products/update" className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="productId" value={id} />

        <label className="block">
          <span className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase">
            Title
          </span>
          <input
            type="text"
            name="title"
            defaultValue={product.title}
            required
            className="mt-2 w-full border tt-border-light bg-background px-3 py-2 text-sm tt-text-on-light"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase">
            Description
          </span>
          <p className="mt-1 text-[11px] text-gray-500">
            Basic HTML is fine here (e.g. &lt;br&gt; for a line break) — it&apos;s stored the way
            you type it.
          </p>
          <textarea
            name="description"
            defaultValue={product.description ?? ""}
            rows={12}
            className="mt-2 w-full border tt-border-light bg-background px-3 py-2 text-sm tt-text-on-light"
          />
        </label>

        <button
          type="submit"
          className="tt-bg-dark px-4 py-3 text-[11px] font-bold tracking-[0.2em] tt-text-primary uppercase transition-opacity hover:opacity-90"
        >
          Save
        </button>
      </form>
    </main>
  );
}
