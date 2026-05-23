"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";
import { useEffect } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function CheckoutStripeProvider({
  active,
  children,
}: {
  /**
   * True once checkout has a PaymentIntent (see `CheckoutPageWithStripe`). Used when Stripe
   * is misconfigured (`!stripePromise`) to optionally show setup instructions; when Stripe is
   * configured we always wrap with `Elements` so children do not remount when this flips.
   */
  active: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    console.log(
      "[CheckoutStripeProvider] active:",
      active,
      "stripeConfigured:",
      !!stripePromise,
    );
  }, [active]);

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

  // Always wrap with Elements when Stripe is configured so toggling `active` does not swap
  // Fragment → Elements and remount children (which would reset CheckoutPageClient state,
  // including clientSecret). Card UI only mounts when clientSecret is set in the child tree.
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
