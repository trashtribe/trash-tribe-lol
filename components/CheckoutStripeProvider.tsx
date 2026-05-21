"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function CheckoutStripeProvider({
  active,
  children,
}: {
  /** When false, Stripe.js Elements is not mounted (avoids iframes blocking the checkout form). */
  active: boolean;
  children: ReactNode;
}) {
  if (!stripePromise) {
    return (
      <>
        {active ? (
          <div className="border-b border-black/10 bg-white px-4 py-8 text-center text-sm tt-text-on-light">
            Payments are not configured. Add{" "}
            <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
            to your environment.
          </div>
        ) : null}
        {children}
      </>
    );
  }

  if (!active) {
    return <>{children}</>;
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
