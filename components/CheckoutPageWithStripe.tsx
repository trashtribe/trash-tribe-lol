"use client";

import { useCallback, useState } from "react";

import { CheckoutPageClient } from "@/components/CheckoutPageClient";
import { CheckoutStripeProvider } from "@/components/CheckoutStripeProvider";

export function CheckoutPageWithStripe() {
  const [stripeElementsActive, setStripeElementsActive] = useState(false);

  const onStripeElementsActiveChange = useCallback((active: boolean) => {
    setStripeElementsActive(active);
  }, []);

  return (
    <CheckoutStripeProvider active={stripeElementsActive}>
      <CheckoutPageClient
        onStripeElementsActiveChange={onStripeElementsActiveChange}
      />
    </CheckoutStripeProvider>
  );
}
