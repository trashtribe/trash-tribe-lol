"use client";

import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const cardElementOptions: StripeCardElementOptions = {
  hidePostalCode: true,
  /** Hide “Save with Link” / Link button in Card Element — see Stripe Card Element docs. */
  disableLink: true,
  style: {
    base: {
      color: "#111",
      fontFamily: "system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "#737373" },
    },
    invalid: {
      color: "#ff53e3",
    },
  },
};

type Props = {
  clientSecret: string;
  disabled?: boolean;
  onSuccess: (paymentIntentId: string) => void;
};

export function CheckoutCardPayment({
  clientSecret,
  disabled = false,
  onSuccess,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || !stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setError(null);
    setSubmitting(true);

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

    setSubmitting(false);

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  }

  const busy = submitting || disabled;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded border border-black/15 bg-white px-3 py-3">
        <CardElement options={cardElementOptions} />
      </div>
      {error ? <p className="text-xs text-[#ff53e3]">{error}</p> : null}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="w-full bg-black py-3.5 text-center text-[11px] font-bold tracking-[0.22em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "PROCESSING…" : "PAY NOW"}
      </button>
    </form>
  );
}
