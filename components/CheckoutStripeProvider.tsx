"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { ReactNode } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export function CheckoutStripeProvider({ children }: { children: ReactNode }) {
  if (!stripePromise) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm tt-text-on-light">
        Payments are not configured. Add{" "}
        <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
        your environment.
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}
