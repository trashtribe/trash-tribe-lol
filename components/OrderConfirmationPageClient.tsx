"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { StoredCompletedOrder } from "@/lib/checkout-order-storage";
import { loadCompletedOrder } from "@/lib/checkout-order-storage";
import { formatEuro } from "@/lib/format-currency";

export function OrderConfirmationPageClient() {
  const [order, setOrder] = useState<StoredCompletedOrder | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setOrder(loadCompletedOrder());
  }, []);

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm tt-text-on-light">Loading…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm tt-text-on-light">
          No order details found. If you just completed checkout, try again from
          the shop.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-block border border-black bg-black px-8 py-3 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-center text-3xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-4xl">
        ORDER CONFIRMED
      </h1>
      <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed tt-text-on-light">
        Thank you for your order. We&apos;ll send a confirmation to{" "}
        <span className="font-bold text-black">{order.email}</span> with updates
        when your package ships.
      </p>

      <div className="mt-12 border border-black/10 bg-white p-6 sm:p-8">
        <h2 className="text-sm font-bold tracking-[0.2em] tt-text-on-light uppercase">
          Order summary
        </h2>
        <ul className="mt-6 space-y-4">
          {order.lines.map((line) => (
            <li
              key={line.key}
              className="flex gap-3 border-b border-black/10 pb-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-black/10 bg-white p-1">
                <Image
                  src={line.imageSrc}
                  alt={line.name}
                  fill
                  sizes="64px"
                  className="object-contain object-center"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.1em] tt-text-on-light uppercase">
                  {line.name}
                </p>
                {line.size ? (
                  <p className="mt-0.5 text-[11px] text-black/55">
                    Size: {line.size}
                  </p>
                ) : null}
                <p className="mt-1 text-xs tt-text-on-light">
                  Qty {line.quantity} · {formatEuro(line.lineTotal)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between tt-text-on-light">
            <dt>Subtotal</dt>
            <dd className="font-bold">{formatEuro(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between tt-text-on-light">
            <dt>Shipping</dt>
            <dd className="font-bold">
              {order.shipping === 0 ? "Free" : formatEuro(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold tt-text-on-light">
            <dt>Total</dt>
            <dd>{formatEuro(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-[11px] text-black/50">
          {order.shippingMethod === "express"
            ? "Express shipping (2–3 days)"
            : "Standard shipping (5–7 days)"}
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/shop"
          className="w-full max-w-md border border-black bg-black py-3.5 text-center text-[11px] font-bold tracking-[0.22em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 sm:w-auto sm:px-16"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  );
}
