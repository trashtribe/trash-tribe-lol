"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "./CartProvider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CartSidebar() {
  const {
    items,
    isOpen,
    subtotal,
    closeCart,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <>
      <button
        type="button"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={closeCart}
        className={`fixed inset-0 z-[120] bg-black/45 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-[130] h-full w-full max-w-[400px] border-l tt-border-light bg-background shadow-[-12px_0_30px_rgba(0,0,0,0.16)] transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b tt-border-light px-5 py-4">
            <h2 className="text-base font-bold tracking-[0.18em] tt-text-on-light uppercase">
              Your cart
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="text-lg tt-text-on-light transition-colors hover:tt-text-secondary"
              aria-label="Close cart"
            >
              ×
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <p className="text-sm tt-text-on-light">Your cart is empty.</p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.key} className="border-b tt-border-light pb-4">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden border tt-border-light bg-background p-1">
                        <Image
                          src={item.imageSrc}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain object-center"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold tracking-[0.1em] tt-text-on-light uppercase">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[11px] tt-text-on-light">
                              {item.size ? `Size: ${item.size}` : "Default variant"}
                            </p>
                            <p className="mt-1 text-sm font-bold tt-text-on-light">
                              {item.price}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="tt-text-on-light transition-colors hover:tt-text-secondary"
                            aria-label={`Remove ${item.name}`}
                          >
                            ×
                          </button>
                        </div>

                        <div className="mt-3 inline-flex items-center border tt-border-light">
                          <button
                            type="button"
                            className="h-8 w-8 tt-text-on-light transition-colors hover:tt-text-secondary"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => updateQuantity(item.key, Math.max(1, item.quantity - 1))}
                          >
                            -
                          </button>
                          <span className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold tt-text-on-light">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-8 w-8 tt-text-on-light transition-colors hover:tt-text-secondary"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t tt-border-light px-5 py-4">
            <div className="flex items-center justify-between text-sm font-bold tt-text-on-light">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs tt-text-on-light">Free shipping over €100</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 block w-full bg-[color:var(--tt-bg-dark)] px-4 py-3 text-center text-sm font-bold tracking-[0.18em] tt-text-primary uppercase transition-colors hover:tt-text-secondary"
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full text-center text-xs font-bold tracking-[0.16em] tt-text-on-light uppercase underline underline-offset-4 transition-colors hover:tt-text-secondary"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
